import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import axios from 'axios';
import { Logger } from '../../core/logger';

@injectable()
export class AiAnalysisService {
    private apiKey: string;

    constructor(@inject('PrismaClient') private prisma: PrismaClient) {
        this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    }

    async analyzeUserDrift(userId: string) {
        if (!this.apiKey) {
            Logger.warn('[AI Analysis] No Anthropic API key found. Skipping analysis.');
            return;
        }

        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                action_instances: {
                    where: {
                        scheduled_start_time: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        }
                    },
                    include: { action: true }
                }
            }
        });

        if (!user || user.action_instances.length === 0) return;

        const historySummary = user.action_instances.map(i => ({
            title: i.action?.title,
            scheduled: i.scheduled_start_time,
            status: i.status,
            executed: i.executed_at
        }));

        const prompt = `
            Analyze the following 7-day discipline history for an Iron-X user.
            Identify the primary drift pattern (e.g., "Weekend Slump", "Morning Lag").
            Suggest a root cause and a recommended adjustment.
            
            History:
            ${JSON.stringify(historySummary, null, 2)}
            
            Return ONLY a JSON object with: 
            { 
              "pattern": string, 
              "rootCause": string, 
              "adjustment": string, 
              "projectedRecovery": number (0-10), 
              "confidence": "LOW" | "MED" | "HIGH" 
            }
        `;

        try {
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            });

            const content = response.data.content[0].text;
            const analysis = JSON.parse(content);

            const saved = await (this.prisma as any).driftAnalysis.create({
                data: {
                    user_id: userId,
                    primary_drift_pattern: analysis.pattern,
                    root_cause_suggestion: analysis.rootCause,
                    recommended_adjustment: analysis.adjustment,
                    projected_score_recovery: analysis.projectedRecovery,
                    confidence_level: analysis.confidence
                }
            });

            Logger.info(`[AI Analysis] Saved analysis for user ${userId}`);
            return saved;
        } catch (error) {
            Logger.error('[AI Analysis] Failed to analyze drift', error);
            throw error;
        }
    }
}
