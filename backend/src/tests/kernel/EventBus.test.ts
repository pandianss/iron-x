import { kernelEvents, DomainEventType } from '../../kernel/events/bus';

describe('EventBus', () => {
    it('should emit and receive events', (done) => {
        const testPayload = { foo: 'bar' };

        kernelEvents.subscribe(DomainEventType.ACTION_CREATED, (event) => {
            expect(event.type).toBe(DomainEventType.ACTION_CREATED);
            expect(event.payload).toEqual(testPayload);
            done();
        });

        kernelEvents.emitEvent(DomainEventType.ACTION_CREATED, testPayload, 'user-123');
    });

    it('should handle subscriber errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        kernelEvents.subscribe(DomainEventType.VIOLATION_DETECTED, async () => {
            throw new Error('Subscriber failed');
        });

        // Should not throw
        kernelEvents.emitEvent(DomainEventType.VIOLATION_DETECTED, {}, 'user-123');

        // Give it a moment for async execution
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
