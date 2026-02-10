
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function generateSystemDescription() {
    console.log('Generating System Description...');

    const userCount = await prisma.user.count();
    const policyCount = await prisma.policy.count();
    const controlCount = await prisma.control.count();
    const logCount = await prisma.auditLog.count();

    const content = `
# System Description Document
**Generated**: ${new Date().toISOString()}

## 1. System Overview
The Discipline Enforcement System is a behavioral modification platform designed to enforce user-defined rules through varying degrees of intervention (Soft/Hard enforcement).

## 2. Operational Metrics
- **Active Users**: ${userCount}
- **Active Policies**: ${policyCount}
- **Compliance Controls**: ${controlCount}
- **Audit Volume**: ${logCount} events logged

## 3. Architecture
The system relies on a monolithic Node.js/TypeScript server with a SQLite database (for this deployment). 
- **Enforcement Engine**: Evaluates actions against policies.
- **Audit Service**: Immutable logging of all state changes.
- **Compliance Service**: Maps internal operations to regulatory controls.

## 4. Data Flows
1. User defines Action -> System schedules Instances.
2. User reports/misses Action -> System calculates Score.
3. Policy Engine evaluates Score -> Enforces Lockout (if applicable).
4. All steps logged to AuditLog.

`;

    const outputPath = path.join(__dirname, '../../system_description.md');
    fs.writeFileSync(outputPath, content);
    console.log(`System Description generated: ${outputPath}`);
}

generateSystemDescription()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
