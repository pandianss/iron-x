import { singleton } from 'tsyringe';
import prisma from '../../db';
import { Outcome } from '@prisma/client';
import { Logger } from '../../utils/logger';

@singleton()
export class OutcomeRepository {
    async createOutcome(data: {
        user_id?: string;
        team_id?: string;
        title: string;
        description?: string;
        type: string;
        source: string;
        value: string;
        confidence_score?: number;
        linked_instance_ids?: string[];
        valid_from?: Date;
        valid_until?: Date;
    }): Promise<Outcome> {
        const { linked_instance_ids, ...outcomeData } = data;

        // Default valid_from to now if not provided
        const validFrom = outcomeData.valid_from || new Date();

        const outcome = await prisma.outcome.create({
            data: {
                ...outcomeData,
                valid_from: validFrom,
                linked_actions: linked_instance_ids && linked_instance_ids.length > 0 ? {
                    create: linked_instance_ids.map(id => ({
                        instance: { connect: { instance_id: id } }
                    }))
                } : undefined
            },
            include: {
                linked_actions: true
            }
        });

        Logger.info(`Created outcome ${outcome.outcome_id} for user ${data.user_id || 'system'}`);
        return outcome;
    }

    async getOutcomesForUser(userId: string): Promise<Outcome[]> {
        return prisma.outcome.findMany({
            where: { user_id: userId },
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    }

    async getOutcomesForTeam(teamId: string): Promise<Outcome[]> {
        return prisma.outcome.findMany({
            where: { team_id: teamId }, // Direct team outcomes
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    }
}
