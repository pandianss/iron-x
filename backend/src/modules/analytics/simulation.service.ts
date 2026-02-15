
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';

@autoInjectable()
export class SimulationService {
    /**
     * Simulates the impact of behavior changes on the 30-day projected score.
     */
    async runCounterfactual(userId: string, scenarios: { type: 'ADHERENCE_BOOST' | 'BUFFER_INCREASE' | 'STRICT_MODE_TOGGLE', value: number }) {
        const history = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' },
            take: 30
        });

        if (history.length === 0) return { currentProjection: 0, simulatedProjection: 0, delta: 0 };

        const currentScores = history.map(h => h.score);
        const lastScore = currentScores[currentScores.length - 1];

        let simulatedScore = lastScore;

        switch (scenarios.type) {
            case 'ADHERENCE_BOOST':
                // Increase score by a factor of adherence improvement per day
                simulatedScore += scenarios.value * 5;
                break;
            case 'BUFFER_INCREASE':
                // Reduces "Late" penalties, improving baseline
                simulatedScore += scenarios.value * 2;
                break;
            case 'STRICT_MODE_TOGGLE':
                // Harder to maintain but higher multiplier if successful
                simulatedScore = scenarios.value === 1 ? simulatedScore * 1.2 : simulatedScore * 0.8;
                break;
        }

        return {
            currentScore: lastScore,
            simulatedScore: Math.min(Math.max(simulatedScore, 0), 100),
            delta: parseFloat((simulatedScore - lastScore).toFixed(2)),
            impact: simulatedScore > lastScore ? 'POSITIVE' : 'NEGATIVE'
        };
    }
}
