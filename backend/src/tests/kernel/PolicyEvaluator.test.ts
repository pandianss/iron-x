import 'reflect-metadata';
import { PolicyEvaluator } from '../../kernel/PolicyEvaluator';
import { TestFactory } from '../factories/TestFactory';

describe('PolicyEvaluator', () => {
    let evaluator: PolicyEvaluator;

    beforeEach(() => {
        evaluator = new PolicyEvaluator();
    });

    it('should return rules and mode from context', async () => {
        const context = TestFactory.createContext({
            policy: {
                rules: {
                    max_misses: 5,
                    score_threshold: 60,
                    lockout_hours: 8
                },
                mode: 'HARD'
            }
        });

        const result = await evaluator.evaluate(context as any);

        expect(result.mode).toBe('HARD');
        expect(result.rules.max_misses).toBe(5);
        expect(result.rules.score_threshold).toBe(60);
    });
});
