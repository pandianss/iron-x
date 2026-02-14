import { DisciplineContext, PolicyRules, EnforcementMode } from './domain/types';

export class PolicyEvaluator {
    // Pure function: Rules and Mode are already in Context
    async evaluate(context: DisciplineContext): Promise<{ rules: PolicyRules; mode: EnforcementMode }> {
        const { rules, mode } = context.policy;
        return { rules, mode };
    }
}
