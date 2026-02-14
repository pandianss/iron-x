"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnforcementMode = void 0;
const policyService_1 = require("../services/policyService");
const updateEnforcementMode = async (req, res) => {
    try {
        const { mode } = req.body;
        const userId = req.user.userId;
        if (!['NONE', 'SOFT', 'HARD'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }
        await policyService_1.PolicyService.setEnforcementMode(userId, mode);
        res.json({ message: 'Enforcement mode updated', mode });
    }
    catch (error) {
        console.error('Error updating enforcement mode', error);
        res.status(500).json({ error: 'Failed to update enforcement mode' });
    }
};
exports.updateEnforcementMode = updateEnforcementMode;
