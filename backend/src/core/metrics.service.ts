import { singleton, injectable } from 'tsyringe';
import * as prom from 'prom-client';
import { Request, Response } from 'express';

@injectable()
@singleton()
export class MetricsService {
    private registry: prom.Registry;
    
    // Custom metrics
    public kernelCycleDuration: prom.Histogram<string>;
    public violationCount: prom.Counter<string>;
    public queueDepth: prom.Gauge<string>;
    public lockoutsTotal: prom.Counter<string>;
    public scoreTransitionsTotal: prom.Counter<string>;
    public cacheOpsTotal: prom.Counter<string>;
    public paymentOpsTotal: prom.Counter<string>;

    constructor() {
        this.registry = new prom.Registry();
        prom.collectDefaultMetrics({ register: this.registry });

        this.kernelCycleDuration = new prom.Histogram({
            name: 'iron_kernel_cycle_duration_seconds',
            help: 'Duration of kernel execution cycles',
            labelNames: ['user_id', 'status'],
            registers: [this.registry]
        });

        this.violationCount = new prom.Counter({
            name: 'iron_violations_total',
            help: 'Total number of detected discipline violations',
            labelNames: ['type', 'severity'],
            registers: [this.registry]
        });

        this.kernelCycleDuration = new prom.Histogram({
            name: 'iron_kernel_cycle_duration_seconds',
            help: 'Duration of kernel execution cycles',
            labelNames: ['user_id', 'status'],
            registers: [this.registry]
        });

        this.violationCount = new prom.Counter({
            name: 'iron_violations_total',
            help: 'Total number of detected discipline violations',
            labelNames: ['type', 'severity'],
            registers: [this.registry]
        });

        this.queueDepth = new prom.Gauge({
            name: 'iron_queue_depth',
            help: 'Current depth of kernel operation queues',
            labelNames: ['queue_name'],
            registers: [this.registry]
        });

        this.lockoutsTotal = new prom.Counter({
            name: 'iron_lockouts_total',
            help: 'Total number of system-enforced lockouts',
            labelNames: ['mode', 'reason'],
            registers: [this.registry]
        });

        this.scoreTransitionsTotal = new prom.Counter({
            name: 'iron_score_transitions_total',
            help: 'Total number of discipline score classification transitions',
            labelNames: ['from', 'to'],
            registers: [this.registry]
        });

        this.cacheOpsTotal = new prom.Counter({
            name: 'iron_cache_operations_total',
            help: 'Total number of cache operations',
            labelNames: ['layer', 'result'],
            registers: [this.registry]
        });

        this.paymentOpsTotal = new prom.Counter({
            name: 'iron_payment_operations_total',
            help: 'Total number of payment/webhook operations',
            labelNames: ['provider', 'status'],
            registers: [this.registry]
        });
    }

    async getMetrics(req: Request, res: Response) {
        res.set('Content-Type', this.registry.contentType);
        res.end(await this.registry.metrics());
    }

    recordCacheOp(layer: 'L1' | 'L2' | 'TOTAL', result: 'HIT' | 'MISS') {
        this.cacheOpsTotal.inc({ layer, result });
    }

    getRegistry() {
        return this.registry;
    }
}
