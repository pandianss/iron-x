import { kernel } from '../kernel/DisciplineEngine';
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';
import { domainEvents } from '../kernel/domain/events';

async function verify() {
    console.log('--- Kernel Verification (Event-Based) ---');

    // 1. Setup Test User
    const userId = uuidv4();
    console.log(`Creating test user ${userId}...`);

    await prisma.user.create({
        data: {
            user_id: userId,
            email: `test-${userId}@example.com`,
            current_discipline_score: 50,
            discipline_classification: 'STABLE',
            password_hash: 'dummy_hash',
            timezone: 'UTC'
        }
    });

    // 2. Setup Event Listener
    let cycleEventReceived = false;
    let calculatedScore = 0;

    const listener = (event: any) => {
        if (event.type === 'KERNEL_CYCLE_COMPLETED' && event.userId === userId) {
            console.log('[Verify] Received KERNEL_CYCLE_COMPLETED event:', event.payload);
            cycleEventReceived = true;
            calculatedScore = event.payload.score;
        }
    };

    domainEvents.on('KERNEL_CYCLE_COMPLETED' as any, listener);

    // 3. Run Cycle
    console.log('Running Kernel Cycle...');
    try {
        await kernel.runCycle({
            userId,
            traceId: uuidv4(),
            timestamp: new Date()
        });
        console.log('Cycle completed successfully.');
    } catch (e) {
        console.error('Cycle failed:', e);
        process.exit(1);
    }

    // 4. Verify
    if (!cycleEventReceived) {
        console.error('FAIL: Did not receive KERNEL_CYCLE_COMPLETED event.');
        console.log('Check if kernel emits the event properly.');
        // process.exit(1);
    } else {
        if (calculatedScore !== 50) {
            console.error(`FAIL: Score mismatch. Expected 50, got ${calculatedScore}`);
        } else {
            console.log('PASS: Score verification (50)');
        }
    }

    // 5. Clean up
    console.log('Cleaning up...');
    await prisma.user.delete({ where: { user_id: userId } });
    console.log('Done.');
    process.exit(0);
}

verify();
