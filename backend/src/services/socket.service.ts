
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;

    private constructor() { }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    initialize(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
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
