
import { container } from 'tsyringe';
import { kernelEvents, DomainEventType, DomainEvent } from '../../kernel/events/bus';
import { DisciplineStateService } from '../../services/disciplineState.service';
import { SocketService } from '../../services/socket.service';

export class DisciplineSubscriber {
    private static isInitialized = false;

    static initialize() {
        if (this.isInitialized) {
            console.warn('[DisciplineSubscriber] Already initialized. Skipping duplicate initialization.');
            return;
        }

        const service = container.resolve(DisciplineStateService);
        const socketService = SocketService.getInstance();

        kernelEvents.subscribe(DomainEventType.INSTANCE_STATUS_CHANGED, async (event: DomainEvent) => {
            if (!event.userId) return;

            console.log(`[DisciplineSubscriber] Instance ${event.payload.instanceId} status changed. Updating score for user ${event.userId}`);

            try {
                const newScore = await service.updateDisciplineScore(event.userId);
                console.log(`[DisciplineSubscriber] Score updated to ${newScore} for user ${event.userId}`);

                // Emit real-time update
                socketService.emitToUser(event.userId, 'SCORE_UPDATED', {
                    newScore,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error(`[DisciplineSubscriber] Failed to update score:`, error);
            }
        });

        this.isInitialized = true;
        console.log('[DisciplineSubscriber] Initialized');
    }
}
