
import { DisciplineContext } from './domain/types';
import { InstanceLifecycle } from './InstanceLifecycle';
import { ExecutionPipeline } from './ExecutionPipeline';
import { PolicyEvaluator } from './PolicyEvaluator';
import { ScoreCalculator } from './ScoreCalculator';

export class DisciplineEngine {
    private lifecycle: InstanceLifecycle;
    private pipeline: ExecutionPipeline;
    private policy: PolicyEvaluator;
    private calculator: ScoreCalculator;

    constructor() {
        this.lifecycle = new InstanceLifecycle();
        this.policy = new PolicyEvaluator();
        this.pipeline = new ExecutionPipeline(this.policy);
        this.calculator = new ScoreCalculator();
    }

    async runCycle(context: DisciplineContext) {
        console.log(`[Kernel] Running cycle for ${context.userId}`);

        // 1. Materialize
        await this.lifecycle.materialize(context);

        // 2. Lifecycle: Detect Missed Actions
        const missedIds = await this.lifecycle.detectMissed(context);

        // 3. Pipeline: Handle Violations
        if (missedIds.length > 0) {
            await this.pipeline.handleViolations(context.userId, missedIds);
        }
        await this.pipeline.detectViolations(context); // Other checks

        // 4. Compute Score
        const score = await this.calculator.compute(context.userId);

        // 5. Emit Events (TODO)
    }
}

export const kernel = new DisciplineEngine();
