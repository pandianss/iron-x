"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllControls = exports.getFrameworkStatus = void 0;
const compliance_service_1 = require("../services/compliance.service");
const audit_service_1 = require("../services/audit.service");
const getFrameworkStatus = async (req, res) => {
    try {
        const { framework } = req.params;
        const status = await compliance_service_1.ComplianceService.getGapAnalysis(framework);
        res.json(status);
        // Log auditor access if applicable (checking role done in middleware)
        if (req.user?.role?.name === 'Auditor') {
            await audit_service_1.AuditService.logEvent('AUDITOR_ACCESS', { resource: 'FRAMEWORK_STATUS', framework }, req.user.user_id, req.user.user_id);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch compliance status' });
    }
};
exports.getFrameworkStatus = getFrameworkStatus;
const getAllControls = async (req, res) => {
    try {
        const { framework } = req.params;
        const controls = await compliance_service_1.ComplianceService.getControlsByFramework(framework);
        res.json(controls);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch controls' });
    }
};
exports.getAllControls = getAllControls;
