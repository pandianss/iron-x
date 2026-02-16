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
    TEAM = 'TEAM'
}

// Module definitions
export const MODULE_REGISTRY = {
    [ModuleId.AUTH]: () => import('../modules/auth/auth.module'),
    [ModuleId.USER]: () => import('../modules/user/user.module'),
    [ModuleId.ACTION]: () => import('../modules/actions/action.module'),
    [ModuleId.GOAL]: () => import('../modules/goals/goal.module'),
};

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
