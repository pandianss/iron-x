import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { injectable, singleton } from 'tsyringe';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

@injectable()
@singleton()
export class SocketService {
    private io: Server | null = null;

    constructor() { }

    initialize(httpServer: HttpServer) {
        const REDIS_URL = process.env.REDIS_URL || 'redis://iron_redis:6379';
        const pubClient = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
        const subClient = pubClient.duplicate();

        this.io = new Server(httpServer, {
            adapter: createAdapter(pubClient as any, subClient as any),
            cors: {
                origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            try {
                // Simplified token verification for socket
                // In production, use the same verifyToken logic or shared secret
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
                socket.data.userId = decoded.userId;
                next();
            } catch {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: Socket) => {
            console.log(`[Socket] User connected: ${socket.data.userId}`);

            // Join user-specific room
            if (socket.data.userId) {
                socket.join(`user:${socket.data.userId}`);
            }

            socket.on('disconnect', () => {
                // console.log(`[Socket] User disconnected: ${socket.data.userId}`);
            });
        });

        console.log('[SocketService] Initialized');
    }

    emitToUser(userId: string, event: string, payload: unknown) {
        if (!this.io) {
            console.warn('[SocketService] Not initialized, skipping emit');
            return;
        }
        this.io.to(`user:${userId}`).emit(event, payload);
    }
}
