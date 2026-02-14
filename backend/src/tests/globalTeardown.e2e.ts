import { execSync } from 'child_process';

export default async () => {
    console.log('\nTearing down E2E environment...');
    // Keep container running for inspection if failed? No, clean up.
    // Use 'down -v' to remove volumes and ensure clean slate next time
    execSync('docker compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
};
