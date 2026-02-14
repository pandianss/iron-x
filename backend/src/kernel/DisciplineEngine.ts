import { DisciplineContext } from './domain/types';
import { InstanceLifecycle } from './InstanceLifecycle';
import { ExecutionPipeline } from './ExecutionPipeline';
import { PolicyEvaluator } from './PolicyEvaluator';
import { ScoreCalculator } from './ScoreCalculator';
import { Logger } from '../utils/logger';

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

    async runCycle(contextParams: { userId: string, traceId: string, timestamp: Date }) {
        const startTotal = Date.now();
        Logger.info(`[Kernel] Running cycle for ${contextParams.userId}`);

        // 0. Build Context (Data Access)
        const startLifecycle = Date.now();
        const context = await this.lifecycle.loadContext(contextParams.userId);
        context.traceId = contextParams.traceId;
        context.timestamp = contextParams.timestamp;

        // FREEZE CONTEXT to prevent shared mutable state issues in workers
        // Shallow freeze sufficient for now
        Object.freeze(context);

        const durationLifecycle = Date.now() - startLifecycle;

        // 1. Materialize (Idempotent DB writes)
        await this.lifecycle.materialize(context);

        // 2. Lifecycle: Detect Missed Actions (Updates DB, returns IDs)
        const missedIds = await this.lifecycle.detectMissed(context);

        // Note: Context is frozen, so we cannot update 'context.instances'.
        // Downstream components must rely on 'missedIds' or fetched data.

        // 3. Pipeline: Handle Violations
        const startPipeline = Date.now();
        if (missedIds.length > 0) {
            await this.pipeline.handleViolations(context.userId, missedIds, context);
        }
        await this.pipeline.detectViolations(context);
        const durationPipeline = Date.now() - startPipeline;

        // 4. Compute Score (Pure)
        const startScoring = Date.now();
        const score = await this.calculator.compute(context);
        const durationScoring = Date.now() - startScoring;

        // 5. Emit Events
        const { domainEvents } = require('./domain/events');

        domainEvents.emit('KERNEL_CYCLE_COMPLETED', {
            type: 'KERNEL_CYCLE_COMPLETED',
            timestamp: new Date(),
            userId: context.userId,
            payload: {
                score,
                violations: missedIds.length,
                traceId: context.traceId
            }
        });

        domainEvents.emit('KERNEL_STAGE_TIMING', {
            type: 'KERNEL_STAGE_TIMING',
            timestamp: new Date(),
            userId: context.userId,
            payload: {
                traceId: context.traceId,
                lifecycleMs: durationLifecycle,
                pipelineMs: durationPipeline,
                scoringMs: durationScoring,
                totalMs: Date.now() - startTotal
            }
        });
    }
}

export const kernel = new DisciplineEngine();
