"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const policy_service_1 = require("../policies/policy.service");
let UserController = class UserController {
    constructor(policyService) {
        this.policyService = policyService;
        this.updateEnforcementMode = async (req, res) => {
            try {
                const { mode } = req.body;
                const userId = req.user.userId;
                if (!['NONE', 'SOFT', 'HARD'].includes(mode)) {
                    return res.status(400).json({ error: 'Invalid mode' });
                }
                await this.policyService.setEnforcementMode(userId, mode);
                res.json({ message: 'Enforcement mode updated', mode });
            }
            catch (error) {
                console.error('Error updating enforcement mode', error);
                res.status(500).json({ error: 'Failed to update enforcement mode' });
            }
        };
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.autoInjectable)(),
    __param(0, (0, tsyringe_1.inject)(policy_service_1.PolicyService)),
    __metadata("design:paramtypes", [policy_service_1.PolicyService])
], UserController);
