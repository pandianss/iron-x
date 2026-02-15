
import { io, Socket } from 'socket.io-client';

export class SocketClient {
    private static instance: SocketClient;
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    private constructor() { }

    static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    connect(token: string) {
        if (this.socket?.connected) return;

        const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Handle if API_URL includes /api/v1
        const baseUrl = url.replace(/\/api\/v1$/, '');

        this.socket = io(baseUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        this.socket.on('SCORE_UPDATED', (payload: unknown) => {
            console.log('[Socket] SCORE_UPDATED', payload);
            this.notifyListeners('SCORE_UPDATED', payload);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);

        // Return unsubscribe function
        return () => {
            const list = this.listeners.get(event);
            if (list) {
                this.listeners.set(event, list.filter(cb => cb !== callback));
            }
        };
    }

    private notifyListeners(event: string, payload: unknown) {
        const list = this.listeners.get(event);
        if (list) {
            list.forEach(cb => cb(payload));
        }
    }
}
