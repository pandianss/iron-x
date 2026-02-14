import { container } from 'tsyringe';
import { singleton, inject } from 'tsyringe';
import { OutcomeRepository } from './outcome.repository';
import { OutcomeStats } from './outcome.stats';
import { OutcomeEvaluator } from './outcome.evaluator';
import { IndisciplineCalculator } from './indiscipline.calculator';

@singleton()
export class OutcomeService {
    constructor(
        @inject(OutcomeRepository) public repository: OutcomeRepository,
        @inject(OutcomeStats) public stats: OutcomeStats,
        @inject(OutcomeEvaluator) public evaluator: OutcomeEvaluator,
        @inject(IndisciplineCalculator) public calculator: IndisciplineCalculator
    ) { }

    // Proxy methods to maintain API compatibility during transition, 
    // or expose public members directly if preferred.
    // For this refactor, we expose the sub-services or wrap them.
    // To match the previous 'OutcomeService.getOutcomesForUser' signature:

    async getOutcomesForUser(userId: string) { return this.repository.getOutcomesForUser(userId); }
    async getOutcomesForTeam(teamId: string) { return this.repository.getOutcomesForTeam(teamId); }
    async createOutcome(data: any) { return this.repository.createOutcome(data); }

    async getOrgOutcomeSummary() { return this.stats.getOrgOutcomeSummary(); }
    async generateCSVReport() { return this.stats.generateCSVReport(); }

    async estimateCostOfIndiscipline(userId: string, rate: number) { return this.calculator.estimateCostOfIndiscipline(userId, rate); }

    async evaluateUserOutcomes(userId: string) { return this.evaluator.evaluateUserOutcomes(userId); }
    async computeBaselineComparison(userId: string) { return this.evaluator.computeBaselineComparison(userId); }
    async getValueRealizationData(userId: string) { return this.evaluator.getValueRealizationData(userId); }
}

// Export a singleton instance for backward compatibility with non-DI code (like current controllers)
export const outcomeService = container.resolve(OutcomeService);
