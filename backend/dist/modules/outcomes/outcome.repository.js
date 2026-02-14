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
exports.OutcomeRepository = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
const logger_1 = require("../../utils/logger");
let OutcomeRepository = class OutcomeRepository {
    async createOutcome(data) {
        const { linked_instance_ids, ...outcomeData } = data;
        // Default valid_from to now if not provided
        const validFrom = outcomeData.valid_from || new Date();
        const outcome = await db_1.default.outcome.create({
            data: {
                ...outcomeData,
                valid_from: validFrom,
                linked_actions: linked_instance_ids && linked_instance_ids.length > 0 ? {
                    create: linked_instance_ids.map(id => ({
                        instance: { connect: { instance_id: id } }
                    }))
                } : undefined
            },
            include: {
                linked_actions: true
            }
        });
        logger_1.Logger.info(`Created outcome ${outcome.outcome_id} for user ${data.user_id || 'system'}`);
        return outcome;
    }
    async getOutcomesForUser(userId) {
        return db_1.default.outcome.findMany({
            where: { user_id: userId },
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    }
    async getOutcomesForTeam(teamId) {
        return db_1.default.outcome.findMany({
            where: { team_id: teamId }, // Direct team outcomes
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    }
};
exports.OutcomeRepository = OutcomeRepository;
exports.OutcomeRepository = OutcomeRepository = __decorate([
    (0, tsyringe_1.singleton)()
], OutcomeRepository);
