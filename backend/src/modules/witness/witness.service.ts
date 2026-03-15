import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../../core/logger';
import { EmailService } from '../communication/email.service';

@injectable()
export class WitnessService {
    constructor(
        @inject('PrismaClient') private prisma: PrismaClient,
        private emailService: EmailService
    ) { }

    async assignWitness(actionId: string, witnessUserId: string) {
        // Verify witness is in the same team
        const action = await this.prisma.action.findUnique({
            where: { action_id: actionId },
            include: { user: { include: { team_memberships: true } } }
        });

        if (!action || !action.user) throw new Error('Action or User not found');

        const witness = await this.prisma.user.findUnique({
            where: { user_id: witnessUserId },
            include: { team_memberships: true }
        });

        if (!witness) throw new Error('Witness not found');

        // Check for shared team
        const userTeams = action.user.team_memberships.map(m => m.team_id);
        const witnessTeams = witness.team_memberships.map(m => m.team_id);
        const sharedTeam = userTeams.some(id => witnessTeams.includes(id));

        if (!sharedTeam) throw new Error('Witness must be a team member');

        await (this.prisma.action.update({
            where: { action_id: actionId },
            data: { witness_user_id: witnessUserId } as any
        }) as any);

        Logger.info(`[Witness] Assigned ${witnessUserId} as witness for action ${actionId}`);
    }

    async handleActionMissed(instanceId: string) {
        const instance = await this.prisma.actionInstance.findUnique({
            where: { instance_id: instanceId },
            include: {
                action: { include: { witness: true, user: true } }
            }
        });

        if ((instance as any)?.action?.witness) {
            const witness = (instance as any).action.witness;
            const targetUser = (instance as any).action.user;
            const message = `[User ${targetUser?.email}] missed: [${(instance as any).action.title}]. DS impact: -10.`;

            await this.emailService.sendEmail(witness.email, 'Witness Alert: Action Missed', message);

            await (this.prisma as any).witnessNotification.create({
                data: {
                    action_id: instanceId,
                    witness_id: witness.user_id,
                    event: 'MISS'
                }
            });
        }
    }

    async handleActionCompleted(instanceId: string) {
        const instance = await this.prisma.actionInstance.findUnique({
            where: { instance_id: instanceId },
            include: {
                action: { include: { witness: true, user: true } }
            }
        });

        if ((instance as any)?.action?.witness) {
            const witness = (instance as any).action.witness;
            const targetUser = (instance as any).action.user;
            const message = `[User ${targetUser?.email}] completed: [${(instance as any).action.title}].`;

            await this.emailService.sendEmail(witness.email, 'Witness Alert: Action Completed', message);

            await (this.prisma as any).witnessNotification.create({
                data: {
                    action_id: instanceId,
                    witness_id: witness.user_id,
                    event: 'COMPLETED'
                }
            });
        }
    }
}
