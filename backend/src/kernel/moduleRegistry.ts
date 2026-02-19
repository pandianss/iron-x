export enum ModuleId {
    // Core
    AUTH = 'AUTH',
    USER = 'USER',
    ACTION = 'ACTION',
    GOAL = 'GOAL',
    OUTCOME = 'OUTCOME',
    POLICY = 'POLICY',
    DISCIPLINE = 'DISCIPLINE',

    // Enterprise (Active)
    AUDIT = 'AUDIT',
    ANALYTICS = 'ANALYTICS',
    BILLING = 'BILLING',
    SUBSCRIPTION = 'SUBSCRIPTION',
    ORGANIZATION = 'ORGANIZATION',
    TEAM = 'TEAM',

    // Experimental/Placeholder (to resolve build errors)
    OPS = 'OPS',
    INTEGRATION = 'INTEGRATION',
    SECURITY = 'SECURITY',
    COMPLIANCE = 'COMPLIANCE',
    TRAJECTORY = 'TRAJECTORY'
}

// Module definitions - lazy factories will be added here as modules are formalized
export const MODULE_REGISTRY = {};

export const ACTIVE_MODULES: ModuleId[] = [
    ModuleId.AUTH,
    ModuleId.USER,
    ModuleId.ACTION,
    ModuleId.GOAL,
    ModuleId.OUTCOME,
    ModuleId.POLICY,
    ModuleId.DISCIPLINE,
    ModuleId.AUDIT,
    ModuleId.ANALYTICS,
    ModuleId.BILLING,
    ModuleId.SUBSCRIPTION,
    ModuleId.ORGANIZATION,
    ModuleId.TEAM
];

export const isModuleActive = (id: ModuleId): boolean => {
    return ACTIVE_MODULES.includes(id);
};
