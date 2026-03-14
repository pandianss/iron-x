import { Request, Response } from 'express';
import { container } from 'tsyringe';
import prisma from '../../db';
import { SubscriptionService } from '../subscription/subscription.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../../middleware/authMiddleware';

export class CoachController {
    private subscriptionService: SubscriptionService;

    constructor() {
        this.subscriptionService = container.resolve(SubscriptionService);
    }

    async initializeCoach(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;
            const { coachName } = req.body;

            // 1. Check subscription
            const sub = await this.subscriptionService.getSubscription(userId);
            if (!sub || sub.plan_tier !== 'TEAM_ENTERPRISE') {
                return res.status(403).json({ error: 'Coach Mode requires INSTITUTIONAL tier.' });
            }

            // 2. Create organization
            const user = await prisma.user.findUnique({ where: { user_id: userId } });
            if (!user) return res.status(404).json({ error: 'User not found' });

            const slug = user.email.split('@')[0] + '-coaching';

            const org = await (prisma as any).organization.upsert({
                where: { slug },
                update: {},
                create: { name: coachName || `${slug} Coaching`, slug }
            });

            // 3. Create default team
            const team = await prisma.team.create({
                data: { name: "My Clients", owner_id: userId, org_id: org.org_id, max_seats: 50 }
            });

            // 4. Assign coach role
            await prisma.user.update({
                where: { user_id: userId },
                data: { org_id: org.org_id, role_id: 'role_coach' }
            });

            // 5. Generate invite token
            const token = uuidv4();
            await prisma.teamInvitation.create({
                data: {
                    team_id: team.team_id,
                    token: token,
                    email: '', // Generic link
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });

            return res.json({
                org_id: org.org_id,
                org_slug: slug,
                team_id: team.team_id,
                invite_link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${token}`
            });

        } catch (error: any) {
            console.error('Coach initialization error', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    async getCoachDashboard(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.userId;

            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                include: {
                    role: true,
                    teams_owned: {
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            user_id: true,
                                            email: true,
                                            current_discipline_score: true,
                                            discipline_classification: true,
                                            trust_tier: true,
                                            enforcement_mode: true,
                                            locked_until: true,
                                            discipline_scores: { 
                                                orderBy: { date: 'desc' }, 
                                                take: 7, 
                                                select: { score: true, date: true } 
                                            },
                                            actions: { 
                                                where: { is_active: true },
                                                select: { action_id: true, title: true, is_active: true } 
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (user?.role?.name !== 'COACH') {
                return res.status(403).json({ error: 'Not a coach account.' });
            }

            const clients = user.teams_owned.flatMap(t => t.members.map(m => m.user)).filter(Boolean);

            const summary = {
                avg_score: clients.length > 0 
                    ? Math.round(clients.reduce((a, c) => a + (c?.current_discipline_score || 0), 0) / clients.length)
                    : 0,
                locked_count: clients.filter(c => c?.locked_until && new Date(c.locked_until) > new Date()).length,
                unreliable_count: clients.filter(c => c?.discipline_classification === 'UNRELIABLE').length,
                stable_count: clients.filter(c => c?.discipline_classification === 'STABLE' || c?.discipline_classification === 'HIGH_RELIABILITY').length,
            };

            return res.json({
                total_clients: clients.length,
                clients,
                summary
            });

        } catch (error: any) {
            console.error('Coach dashboard error', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
