"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
const audit_service_1 = require("../../services/audit.service");
const privacy_1 = require("../../utils/privacy");
const AppError_1 = require("../../utils/AppError");
let TeamController = class TeamController {
    constructor() {
        this.createTeam = async (req, res, next) => {
            try {
                const { name } = req.body;
                const ownerId = req.user.userId;
                const team = await db_1.default.team.create({
                    data: {
                        name,
                        owner_id: ownerId,
                    }
                });
                await db_1.default.teamMember.create({
                    data: {
                        team_id: team.team_id,
                        user_id: ownerId,
                        role: 'MANAGER'
                    }
                });
                res.status(201).json(team);
            }
            catch (error) {
                next(error);
            }
        };
        this.addMember = async (req, res, next) => {
            try {
                const { teamId, email, role } = req.body;
                const requesterId = req.user.userId;
                const membership = await db_1.default.teamMember.findUnique({
                    where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
                });
                if (!membership || membership.role !== 'MANAGER') {
                    throw new AppError_1.ForbiddenError('Not authorized to add members');
                }
                const team = await db_1.default.team.findUnique({
                    where: { team_id: teamId },
                    include: { _count: { select: { members: true } } }
                });
                if (!team)
                    throw new AppError_1.NotFoundError('Team not found');
                if (team._count.members >= team.max_seats) {
                    throw new AppError_1.ForbiddenError(`Seat limit reached (${team.max_seats} max)`);
                }
                const userToAdd = await db_1.default.user.findUnique({ where: { email } });
                if (!userToAdd)
                    throw new AppError_1.NotFoundError('User not found');
                await db_1.default.teamMember.create({
                    data: {
                        team_id: teamId,
                        user_id: userToAdd.user_id,
                        role: role || 'MEMBER'
                    }
                });
                await audit_service_1.AuditService.logEvent('TEAM_MEMBER_ADDED', { teamId, addedUserId: userToAdd.user_id, role }, userToAdd.user_id, requesterId);
                res.status(201).json({ message: 'Member added' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTeamStats = async (req, res, next) => {
            try {
                const { teamId } = req.params;
                const requesterId = req.user.userId;
                const membership = await db_1.default.teamMember.findUnique({
                    where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
                });
                if (!membership || membership.role !== 'MANAGER') {
                    throw new AppError_1.ForbiddenError('Not authorized to view team stats');
                }
                const members = await db_1.default.teamMember.findMany({
                    where: { team_id: teamId },
                    include: {
                        user: {
                            select: {
                                user_id: true,
                                email: true,
                                current_discipline_score: true,
                                enforcement_mode: true,
                                locked_until: true,
                            }
                        }
                    }
                });
                const stats = {
                    totalMembers: members.length,
                    avgScore: members.reduce((sum, m) => sum + (m.user.current_discipline_score || 0), 0) / members.length || 0,
                    statusCounts: {
                        normal: members.filter((m) => !m.user.locked_until).length,
                        locked: members.filter((m) => m.user.locked_until && m.user.locked_until > new Date()).length,
                        warning: members.filter((m) => (m.user.current_discipline_score || 100) < 50 && (!m.user.locked_until || m.user.locked_until < new Date())).length
                    },
                    members: members.map((m) => (0, privacy_1.sanitizeMemberProfile)(m, membership.role))
                };
                res.json(stats);
            }
            catch (error) {
                next(error);
            }
        };
        this.exportComplianceReport = async (req, res, next) => {
            try {
                const { ReportService } = await Promise.resolve().then(() => __importStar(require('../../services/report.service')));
                const { teamId } = req.params;
                const requesterId = req.user.userId;
                const membership = await db_1.default.teamMember.findUnique({
                    where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
                });
                if (!membership || membership.role !== 'MANAGER') {
                    throw new AppError_1.ForbiddenError('Not authorized to export report');
                }
                const csv = await ReportService.generateTeamComplianceReport(teamId);
                res.set('Content-Type', 'text/csv');
                res.set('Content-Disposition', `attachment; filename="compliance_report_${teamId}.csv"`);
                res.send(csv);
            }
            catch (error) {
                next(error);
            }
        };
    }
};
exports.TeamController = TeamController;
exports.TeamController = TeamController = __decorate([
    (0, tsyringe_1.autoInjectable)()
], TeamController);
