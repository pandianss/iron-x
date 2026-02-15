import { isModuleActive, ModuleId, ACTIVE_MODULES } from '../../kernel/moduleRegistry';

describe('Module Registry', () => {
    it('should explicitly list active modules', () => {
        expect(ACTIVE_MODULES).toContain(ModuleId.AUTH);
        expect(ACTIVE_MODULES).toContain(ModuleId.USER);
        expect(ACTIVE_MODULES).toContain(ModuleId.ACTION);
        // ... verify others if strictness needed
    });

    it('should return true for active modules', () => {
        expect(isModuleActive(ModuleId.AUTH)).toBe(true);
        expect(isModuleActive(ModuleId.DISCIPLINE)).toBe(true);
    });

    it('should return false for inactive (experimental) modules', () => {
        expect(isModuleActive(ModuleId.OPS)).toBe(false);
        expect(isModuleActive(ModuleId.INTEGRATION)).toBe(false);
        expect(isModuleActive(ModuleId.SECURITY)).toBe(false);
        expect(isModuleActive(ModuleId.COMPLIANCE)).toBe(false);
        expect(isModuleActive(ModuleId.TRAJECTORY)).toBe(false);
    });

    it('should verify critical path modules are active', () => {
        // Essential for kernel operation
        expect(isModuleActive(ModuleId.POLICY)).toBe(true);
        expect(isModuleActive(ModuleId.DISCIPLINE)).toBe(true);
    });
});
