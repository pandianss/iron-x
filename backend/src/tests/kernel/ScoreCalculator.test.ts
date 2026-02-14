import 'reflect-metadata';
import { ScoreCalculator } from '../../kernel/ScoreCalculator';
import { TestFactory } from '../factories/TestFactory';
import { DomainEventType } from '../../kernel/domain/events';

// Mock domainEvents locally
const mockEmit = jest.fn();
jest.mock('../../kernel/domain/events', () => ({
    domainEvents: {
        emit: (...args: any[]) => mockEmit(...args),
        on: jest.fn()
    },
    DomainEventType: {
        SCORE_UPDATED: 'SCORE_UPDATED'
    }
}));

describe('ScoreCalculator', () => {
    let calculator: ScoreCalculator;

    beforeEach(() => {
        calculator = new ScoreCalculator();
        mockEmit.mockClear();
    });

    it('should return 50 if no instances exist', async () => {
        const context = TestFactory.createContext({ instances: [] } as any);
        const score = await calculator.compute(context as any);
        expect(score).toBe(50);
    });

    it('should return 100 if all instances are COMPLETED', async () => {
        const instances = [
            TestFactory.createInstance({ status: 'COMPLETED' }),
            TestFactory.createInstance({ status: 'COMPLETED' })
        ];
        const context = TestFactory.createContext({ instances } as any);
        const score = await calculator.compute(context as any);
        expect(score).toBe(100);
    });

    it('should return 0 if all instances are MISSED', async () => {
        const instances = [
            TestFactory.createInstance({ status: 'MISSED' }),
            TestFactory.createInstance({ status: 'MISSED' })
        ];
        const context = TestFactory.createContext({ instances } as any);
        const score = await calculator.compute(context as any);
        expect(score).toBe(0);
    });

    it('should calculate partial score correctly', async () => {
        const instances = [
            TestFactory.createInstance({ status: 'COMPLETED' }),
            TestFactory.createInstance({ status: 'MISSED' })
        ];
        const context = TestFactory.createContext({ instances } as any);
        const score = await calculator.compute(context as any);
        expect(score).toBe(50);
    });

    it('should emit SCORE_UPDATED when score changes', async () => {
        const instances = [TestFactory.createInstance({ status: 'COMPLETED' })];
        const context = TestFactory.createContext({
            instances,
            user: { current_discipline_score: 50 }
        } as any);

        const score = await calculator.compute(context as any);

        expect(score).toBe(100);
        expect(mockEmit).toHaveBeenCalledWith(DomainEventType.SCORE_UPDATED, expect.objectContaining({
            userId: context.userId,
            payload: expect.objectContaining({
                oldScore: 50,
                newScore: 100
            })
        }));
    });

    it('should NOT emit SCORE_UPDATED when score is unchanged', async () => {
        const instances = [TestFactory.createInstance({ status: 'COMPLETED' })];
        const context = TestFactory.createContext({
            instances,
            user: { current_discipline_score: 100 } // Already 100
        } as any);

        const score = await calculator.compute(context as any);

        expect(score).toBe(100);
        expect(mockEmit).not.toHaveBeenCalled();
    });
});
