
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.argv[2];

async function upgrade() {
    if (!email) {
        console.error('Please provide email');
        process.exit(1);
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        await prisma.subscription.upsert({
            where: { user_id: user.user_id },
            update: { plan_tier: 'INDIVIDUAL_PRO' },
            create: {
                user_id: user.user_id,
                plan_tier: 'INDIVIDUAL_PRO'
            }
        });
        console.log(`Upgraded user ${email} to INDIVIDUAL_PRO`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

upgrade();
