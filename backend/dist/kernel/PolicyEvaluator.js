"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEvaluator = void 0;
class PolicyEvaluator {
    // Pure function: Rules and Mode are already in Context
    async evaluate(context) {
        const { rules, mode } = context.policy;
        return { rules, mode };
    }
}
exports.PolicyEvaluator = PolicyEvaluator;
