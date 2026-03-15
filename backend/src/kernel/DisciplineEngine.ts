import { DisciplineContext, DomainEventType } from './domain/types';
import { InstanceLifecycle } from './InstanceLifecycle';
import { ExecutionPipeline } from './ExecutionPipeline';
import { PolicyEvaluator } from './PolicyEvaluator';
import { ScoreCalculator } from './ScoreCalculator';
import { Logger } from '../core/logger';
import { container } from 'tsyringe';
import { MetricsService } from '../core/metrics.service';

export class DisciplineEngine {
    private pipeline: ExecutionPipeline;
    private policy: PolicyEvaluator;
    private calculator: ScoreCalculator;

    constructor() {
        this.policy = new PolicyEvaluator();
        this.pipeline = new ExecutionPipeline(this.policy);
        this.calculator = new ScoreCalculator();
    }

    async runCycle(contextParams: { userId: string, traceId: string, timestamp: Date }) {
        const startTotal = Date.now();
        Logger.info(`[Kernel] Running cycle for ${contextParams.userId}`);

        const lifecycle = container.resolve(InstanceLifecycle);
        const metrics = container.resolve(MetricsService);
            
        // 1. LOAD CONTEXT
        const startLifecycle = Date.now();
        const context = await lifecycle.loadContext(contextParams.userId);
        context.traceId = contextParams.traceId;
        context.timestamp = contextParams.timestamp;

        const durationLifecycle = Date.now() - startLifecycle;

        // 2. Materialize (Idempotent DB writes)
        await lifecycle.materialize(context);

        // 3. Lifecycle: Detect Missed Actions (Updates DB, returns IDs)
        const missedIds = await lifecycle.detectMissed(context);

        // 4. Pipeline: Handle Violations
        const startPipeline = Date.now();
        if (missedIds.length > 0) {
            await this.pipeline.handleViolations(context.userId, missedIds, context);
        }
        await this.pipeline.detectViolations(context);
        const durationPipeline = Date.now() - startPipeline;

        // 5. Compute Score (Pure)
        const startScoring = Date.now();
        const score = await this.calculator.compute(context);
        const durationScoring = Date.now() - startScoring;

        // 6. Apply Policy Enforcement
        const policyService = container.resolve((await import('../modules/governance/policy.service')).PolicyService);
        await policyService.applyEnforcement(context.userId, score);

        // 7. Emit Events
        const { domainEvents } = await import('./domain/events');

        domainEvents.emit(DomainEventType.KERNEL_CYCLE_COMPLETED, {
            type: DomainEventType.KERNEL_CYCLE_COMPLETED,
            timestamp: new Date(),
            userId: context.userId,
            payload: {
                score,
                violations: missedIds.length,
                traceId: context.traceId
            }
        });

        domainEvents.emit(DomainEventType.KERNEL_STAGE_TIMING, {
            type: DomainEventType.KERNEL_STAGE_TIMING,
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

        // Record metrics
        metrics.kernelCycleDuration.observe(
            { user_id: context.userId, status: score > 50 ? 'healthy' : 'drifting' },
            (Date.now() - startTotal) / 1000
        );

        if (missedIds.length > 0) {
            metrics.violationCount.inc({ type: 'MISSED_ACTION', severity: 'MEDIUM' }, missedIds.length);
        }

        return context;
    }
}

export const kernel = new DisciplineEngine();
