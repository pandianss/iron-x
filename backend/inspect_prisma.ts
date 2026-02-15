
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log(Object.keys(prisma));
// Also try to access $extends or other internal if keys are hidden, but usually models are on top level or $Dmmf
// Let's also check strict equality
async function check() {
    // @ts-ignore
    if (prisma.ssoConfig) console.log('Found: ssoConfig');
    // @ts-ignore
    if (prisma.sSOConfig) console.log('Found: sSOConfig');
    // @ts-ignore
    if (prisma.SSOConfig) console.log('Found: SSOConfig');
}
check().finally(() => prisma.$disconnect());
