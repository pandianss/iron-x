import { execSync } from 'child_process';
import { Client } from 'pg';

export default async () => {
    console.log('\nSetting up E2E environment...');

    // 1. Start Docker Container
    try {
        execSync('docker compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
    } catch (e) {
        console.error('Failed to start docker compose');
        throw e;
    }

    // 2. Wait for DB to be ready
    const client = new Client({
        connectionString: 'postgresql://test_user:test_password@localhost:5434/test_db'
    });

    let retries = 60;
    while (retries > 0) {
        try {
            await new Promise(r => setTimeout(r, 1000));
            await client.connect();
            console.log('Test Database connected successfully.');
            await client.end();
            break;
        } catch (e) {
            retries--;
            if (retries === 0) throw new Error('Could not connect to test database');
        }
    }

    // 3. Run Migrations
    console.log('Running migrations on test database...');
    // We set the DATABASE_URL environment variable for this command specifically
    process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5434/test_db';
    try {
        console.log('Executing prisma db push...');
        // skip-generate to avoid re-generating client (we use the main one)
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env });
        console.log('DB push completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
        throw e;
    }
};
