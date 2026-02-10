
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateMatrix() {
    console.log('Generating Control Mapping Matrix...');

    const controls = await prisma.control.findMany({
        include: {
            mappings: {
                include: {
                    policy: true,
                    system_config: true
                }
            }
        }
    });

    // 1. JSON Artifact
    const artifactPathJSON = path.join(__dirname, '../../control_matrix.json');
    fs.writeFileSync(artifactPathJSON, JSON.stringify(controls, null, 2));
    console.log(`Generated: ${artifactPathJSON}`);

    // 2. CSV Artifact
    const headers = 'Framework,ControlCode,Description,Mechanism,EvidenceSource,MappedPolicy/Config\n';
    const rows = controls.flatMap(c => {
        if (c.mappings.length === 0) {
            return [`"${c.framework}","${c.control_code}","${c.description}","UNMAPPED","",""`];
        }
        return c.mappings.map(m => {
            const linkedEntity = m.policy ? `Policy: ${m.policy.name}` : (m.system_config_key ? `Config: ${m.system_config_key}` : 'N/A');
            return `"${c.framework}","${c.control_code}","${c.description}","${m.enforcement_mechanism}","${m.evidence_source}","${linkedEntity}"`;
        });
    });

    const artifactPathCSV = path.join(__dirname, '../../control_matrix.csv');
    fs.writeFileSync(artifactPathCSV, headers + rows.join('\n'));
    console.log(`Generated: ${artifactPathCSV}`);
}

generateMatrix()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
