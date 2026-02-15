
import { register } from './src/controllers/authController';
import prisma from './src/db';

// Mock Request/Response
const mockReq = (body: any) => ({ body } as any);
const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => { res.statusCode = code; return res; };
    res.json = (data: any) => { res.body = data; return res; };
    return res;
};

async function verifyAssignment() {
    console.log('Verifying Role Assignment on Registration...');

    // 1. Ensure Roles (Run seed logic if needed, but we assume seed_roles ran)
    // We can just run the seed logic here inline to be safe?
    // Let's rely on seed_roles.ts being run before this.

    const email = `new_hire_${Date.now()}@test.com`;
    const req = mockReq({
        email,
        password: 'password123',
        timezone: 'UTC'
    });
    const res = mockRes();

    console.log(`Registering user: ${email}`);
    try {
        await register(req, res);

        if (res.statusCode !== 201) {
            console.error('Registration failed:', res.statusCode, res.body);
            return;
        }

        const userId = res.body.user.id;
        console.log('User registered:', userId);

        // Check DB for Role
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: { role: true } as any
        });

        if (!user) {
            console.error('User not found in DB!');
            return;
        }

        // @ts-expect-error - Intentionally testing invalid input
        if (user.role && user.role.name === 'Employee') {
            console.log('SUCCESS: User assigned "Employee" role automatically.');
            // @ts-expect-error - Intentionally testing invalid input
            console.log('Role ID:', user.role.role_id);
        } else {
            console.error('FAILURE: User has wrong role:', user.role);
        }

    } catch (e) {
        console.error('Verification error:', e);
    }
}

verifyAssignment();
