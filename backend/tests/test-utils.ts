import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export const setupTestDb = async (dbPath: string) => {
    const dbUrl = `file:${dbPath}`;
    const dbName = path.basename(dbPath);

    // Cleanup previous run if exists
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
        } catch (e) {
            console.warn(`[Setup] Could not delete old DB ${dbName}:`, e);
        }
    }

    // Push schema
    try {
        execSync(`npx prisma db push --skip-generate`, {
            env: { ...process.env, DATABASE_URL: dbUrl },
            stdio: 'ignore'
        });
    } catch (e) {
        console.error(`[Setup] Failed to push schema to ${dbName}:`, e);
        throw e;
    }

    const prisma = new PrismaClient({
        datasources: {
            db: { url: dbUrl }
        }
    });

    return { prisma, dbPath, dbUrl };
};

export const teardownTestDb = async (prisma: PrismaClient, dbPath: string) => {
    await prisma.$disconnect();

    // Retry logic for file deletion
    const maxRetries = 5;
    const retryDelay = 500; // ms

    for (let i = 0; i < maxRetries; i++) {
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }
            break; // Success
        } catch (e: any) {
            if (e.code === 'EBUSY' || e.code === 'EPERM') {
                if (i === maxRetries - 1) {
                    console.warn(`[Teardown] Failed to delete test DB ${path.basename(dbPath)} after ${maxRetries} attempts.`);
                } else {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            } else {
                console.warn(`[Teardown] Unexpected error deleting DB:`, e);
                break;
            }
        }
    }
};
