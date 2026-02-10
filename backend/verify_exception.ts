
import { EnforcementService } from './src/services/enforcement.service';
import { ExceptionService } from './src/services/exception.service';
import prisma from './src/db';

async function verifyException() {
    console.log('Verifying Exception Logic...');

    try {
        // 1. Create User
        const email = `exception_test_${Date.now()}@test.com`;
        const user = await prisma.user.create({
            data: {
                email,
                password_hash: 'hash',
                timezone: 'UTC',
                enforcement_mode: 'HARD' // Force HARD mode to trigger checks
            } as any
        });
        console.log('User created:', user.user_id);

        // 2. Grant Exception
        console.log('Granting Exception...');
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 1);

        await ExceptionService.grantException(
            user.user_id,
            'Medical Leave',
            validUntil,
            'admin_user_id'
        );

        // 3. Simulate Missed Action
        console.log('Simulating Missed Action (HARD Mode)...');
        await EnforcementService.handleMissedAction(user.user_id, 'instance_x');

        // 4. Verify No Lockout
        const updatedUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        if (updatedUser?.locked_until && updatedUser.locked_until > new Date()) {
            console.error('FAILURE: User was locked out despite exception!');
        } else {
            console.log('SUCCESS: User was NOT locked out.');
        }

        // 5. Verify Audit Log
        const logs = await prisma.auditLog.findMany({
            where: { target_user_id: user.user_id },
            orderBy: { timestamp: 'desc' },
            take: 2
        });

        const exceptionLog = logs.find(l => l.action === 'ACTION_MISSED_EXCEPTION_APPLIED');
        if (exceptionLog) {
            console.log('SUCCESS: Audit log found for exception application.');
        } else {
            console.error('FAILURE: Audit log for exception application NOT found.', logs);
        }

    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verifyException();
