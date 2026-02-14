
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

        // Register Observers
        // In a real DI container this would be cleaner, but for MVP we wire here
        const { enforcementObserver } = require('../governance/observers/EnforcementObserver');
        const { auditObserver } = require('../governance/observers/AuditObserver');
        const { domainEvents, DomainEventType } = require('./domain/events');

        domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: any) => enforcementObserver.handle(e));
        domainEvents.on(DomainEventType.SCORE_UPDATED, (e: any) => auditObserver.handle(e));
        domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: any) => auditObserver.handle(e));
        domainEvents.on(DomainEventType.INSTANCE_MATERIALIZED, (e: any) => auditObserver.handle(e));
    }

    async runCycle(contextParams: { userId: string, traceId: string, timestamp: Date }) {
        console.log(`[Kernel] Running cycle for ${contextParams.userId}`);

        // 0. Build Context (Data Access)
        const context = await this.lifecycle.loadContext(contextParams.userId);
        context.traceId = contextParams.traceId;
        context.timestamp = contextParams.timestamp;

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
