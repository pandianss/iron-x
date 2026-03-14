import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AiAnalysisService } from '../../services/aiAnalysis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import prisma from '../../db';
import { generateDriftReportPdf } from './driftReport.pdf';
import { AuthRequest } from '../../middleware/authMiddleware';

export class DriftReportController {
    private aiAnalysisService: AiAnalysisService;
    private subscriptionService: SubscriptionService;

    constructor() {
        this.aiAnalysisService = container.resolve(AiAnalysisService);
        this.subscriptionService = container.resolve(SubscriptionService);
    }

    async generateDriftReport(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            // 1. Subscription check
            const sub = await this.subscriptionService.getSubscription(userId);
            const tier = sub?.plan_tier || 'FREE';
            
            if (tier === 'FREE') {
                return res.status(403).json({ 
                    message: "Drift Analysis requires OPERATOR tier.",
                    code: 'PLAN_LIMIT_EXCEEDED_FEATURE'
                });
            }

            // 2. Rate limit: One report per 24 hours
            const lastAnalysis = await (prisma as any).driftAnalysis.findFirst({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });

            const now = new Date();
            if (lastAnalysis && (now.getTime() - new Date(lastAnalysis.created_at).getTime()) < 24 * 60 * 60 * 1000) {
                // Return cached result
                const [scoreHistory, instanceHistory, user] = await this.getReportData(userId);
                const pdfBuffer = await generateDriftReportPdf({ 
                    analysis: lastAnalysis, 
                    scoreHistory, 
                    instanceHistory, 
                    user 
                });
                
                return res.json({ 
                    analysis: lastAnalysis, 
                    pdfBase64: pdfBuffer.toString('base64'), 
                    cached: true, 
                    generated_at: lastAnalysis.created_at 
                });
            }

            // 3. Run AI analysis
            const savedAnalysis = await this.aiAnalysisService.analyzeUserDrift(userId);
            if (!savedAnalysis) {
                return res.status(400).json({ error: "Failed to generate analysis. Ensure you have activity in the last 7 days." });
            }

            // 4. Fetch supporting data
            const [scoreHistory, instanceHistory, user] = await this.getReportData(userId);

            // 5. Generate PDF
            const pdfBuffer = await generateDriftReportPdf({ 
                analysis: savedAnalysis, 
                scoreHistory, 
                instanceHistory, 
                user 
            });

            return res.json({ 
                analysis: savedAnalysis, 
                pdfBase64: pdfBuffer.toString('base64'), 
                cached: false, 
                generated_at: savedAnalysis.created_at 
            });

        } catch (error: any) {
            console.error('Drift report generation error', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    private async getReportData(userId: string) {
        return Promise.all([
            prisma.disciplineScore.findMany({ 
                where: { user_id: userId }, 
                orderBy: { date: 'desc' }, 
                take: 30 
            }),
            prisma.actionInstance.findMany({
                where: { 
                    user_id: userId, 
                    scheduled_start_time: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
                },
                select: { status: true, scheduled_start_time: true }
            }),
            prisma.user.findUnique({ 
                where: { user_id: userId }, 
                select: { 
                    current_discipline_score: true, 
                    discipline_classification: true, 
                    trust_tier: true, 
                    email: true 
                } 
            })
        ]);
    }
}
