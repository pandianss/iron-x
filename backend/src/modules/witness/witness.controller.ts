import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { WitnessService } from '../../services/witness.service';
import prisma from '../../db';
import { AuthRequest } from '../../middleware/authMiddleware';

export class WitnessController {
    private service: WitnessService;

    constructor() {
        this.service = container.resolve(WitnessService);
    }

    async assignWitness(req: AuthRequest, res: Response) {
        const { actionId } = req.params;
        const { witnessUserId } = req.body;
        const userId = req.user!.userId;

        try {
            // Verify the action belongs to this user
            const action = await prisma.action.findUnique({ where: { action_id: actionId } });
            if (!action || action.user_id !== userId) {
                return res.status(403).json({ error: 'Action not found or not yours.' });
            }

            await this.service.assignWitness(actionId, witnessUserId);
            return res.json({ success: true, witnessUserId });
        } catch (error: any) {
            console.error('Witness assignment error', error);
            return res.status(400).json({ error: error.message });
        }
    }

    async removeWitness(req: AuthRequest, res: Response) {
        const { actionId } = req.params;
        const userId = req.user!.userId;

        try {
            const action = await prisma.action.findUnique({ where: { action_id: actionId } });
            if (!action || action.user_id !== userId) {
                return res.status(403).json({ error: 'Not authorized.' });
            }

            await (prisma.action.update({
                where: { action_id: actionId },
                data: { witness_user_id: null } as any
            }) as any);

            return res.json({ success: true });
        } catch (error: any) {
            console.error('Witness removal error', error);
            return res.status(400).json({ error: error.message });
        }
    }

    async getMyWitnessedActions(req: AuthRequest, res: Response) {
        const witnessId = req.user!.userId;
        try {
            const actions = await (prisma as any).action.findMany({
                where: { witness_user_id: witnessId },
                include: {
                    user: { select: { email: true, current_discipline_score: true, trust_tier: true } },
                    action_instances: {
                        orderBy: { scheduled_start_time: 'desc' },
                        take: 5,
                        select: { status: true, scheduled_start_time: true, executed_at: true }
                    }
                }
            });
            return res.json(actions);
        } catch (error: any) {
            console.error('Fetch witnessed actions error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getWitnessNotifications(req: AuthRequest, res: Response) {
        const witnessId = req.user!.userId;
        try {
            const notifs = await (prisma as any).witnessNotification.findMany({
                where: { witness_id: witnessId },
                orderBy: { sent_at: 'desc' },
                take: 50,
                include: {
                    action_instance: {
                        include: { action: { select: { title: true, user: { select: { email: true } } } } }
                    }
                }
            });
            return res.json(notifs);
        } catch (error: any) {
            console.error('Fetch witness notifications error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getTeamMembersForWitness(req: AuthRequest, res: Response) {
        const userId = req.user!.userId;
        try {
            const memberships = await prisma.teamMember.findMany({
                where: { user_id: userId },
                include: {
                    team: {
                        include: {
                            members: {
                                include: { user: { select: { user_id: true, email: true, trust_tier: true, current_discipline_score: true } } }
                            }
                        }
                    }
                }
            });

            const allMembers = memberships.flatMap(m => m.team.members)
                .map(m => m.user)
                .filter((u, i, arr) => u && u.user_id !== userId && arr.findIndex(x => x?.user_id === u?.user_id) === i);

            return res.json(allMembers);
        } catch (error: any) {
            console.error('Fetch eligible witnesses error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
