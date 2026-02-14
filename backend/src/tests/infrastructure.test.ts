import { TestFactory } from './factories/TestFactory';

describe('Test Infrastructure', () => {
    it('should run a basic test', () => {
        expect(true).toBe(true);
    });

    it('should generate a fake user', () => {
        const user = TestFactory.createUser();
        expect(user).toHaveProperty('user_id');
        expect(user).toHaveProperty('email');
    });
});
