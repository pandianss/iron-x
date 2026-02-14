"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutcomeStats = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
let OutcomeStats = class OutcomeStats {
    async getOrgOutcomeSummary() {
        const totalOutcomes = await db_1.default.outcome.count();
        const productivityCount = await db_1.default.outcome.count({ where: { type: 'PRODUCTIVITY' } });
        const reliabilityCount = await db_1.default.outcome.count({ where: { type: 'RELIABILITY' } });
        const complianceCount = await db_1.default.outcome.count({ where: { type: 'COMPLIANCE' } });
        const recentOutcomes = await db_1.default.outcome.findMany({
            take: 10,
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });
        return {
            total: totalOutcomes,
            breakdown: {
                productivity: productivityCount,
                reliability: reliabilityCount,
                compliance: complianceCount
            },
            recent: recentOutcomes
        };
    }
    async generateCSVReport() {
        const outcomes = await db_1.default.outcome.findMany({
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });
        const header = 'Outcome ID,User,Type,Title,Value,Confidence,Date\n';
        const rows = outcomes.map(o => `${o.outcome_id},${o.user?.email || 'System'},${o.type},"${o.title}",${o.value},${o.confidence_score},${o.calculated_at.toISOString()}`).join('\n');
        return header + rows;
    }
};
exports.OutcomeStats = OutcomeStats;
exports.OutcomeStats = OutcomeStats = __decorate([
    (0, tsyringe_1.singleton)()
], OutcomeStats);
