
import { singleton } from 'tsyringe';
import prisma from '../../db';
import * as os from 'os';
import { kernelQueue } from '../../infrastructure/queue';

@singleton()
export class OpsService {
    async getSystemHealth() {
        // Check DB connection
        let dbStatus = 'UP';
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (e) {
            dbStatus = 'DOWN';
        }

        // Check Queue
        let queueStatus = 'UP';
        let waitingJobs = 0;
        try {
            waitingJobs = await (kernelQueue as any).getWaitingCount();
        } catch (e) {
            queueStatus = 'UNKNOWN';
        }

        return {
            status: dbStatus === 'UP' && queueStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            components: {
                database: { status: dbStatus },
                queue: { status: queueStatus, waitingJobs },
            },
            system: {
                memory: {
                    free: os.freemem(),
                    total: os.totalmem(),
                    usage: 1 - (os.freemem() / os.totalmem())
                },
                loadAverage: os.loadavg(),
                uptime: os.uptime()
            }
        };
    }

    async runDatabaseMaintenance() {
        console.log('[Ops] Starting Database Maintenance...');
        try {
            // PostgreSQL specific optimization (Analyze)
            // Note: VACUUM FULL is blocking and should be used with caution.
            // ANALYZE updates statistics for the query planner.
            await prisma.$queryRaw`ANALYZE`;

            // Optional: Clean up expired sessions or temporary data
            // await prisma.session.deleteMany({ where: { expires: { lt: new Date() } } });

            console.log('[Ops] Database Maintenance completed successfully.');
            return { success: true };
        } catch (error) {
            console.error('[Ops] Database Maintenance failed:', error);
            return { success: false, error };
        }
    }
}
