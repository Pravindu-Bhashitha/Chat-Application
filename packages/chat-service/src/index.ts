import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.io with CORS allowed for frontend (port 5173 / Vite default)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use the same secret as auth-service

// Map to track connected users: userId -> socketId
const onlineUsers = new Map<string, string>();

// 1. Socket Authentication Middleware
io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
        // Safely extract the ID regardless of property name in JWT payload
        const userId = decoded.userId ;

        if (!userId) {
            console.error('❌ Token verified, but no user ID field found in payload:', decoded);
            return next(new Error('Authentication error: Invalid token payload'));
        }

        socket.data.user = {
            id: userId,
            username: decoded.username ,
        };
        // console.log(`✅ Authenticated user: ${decoded}`);
        // socket.data.user = decoded; // Attach user payload to socket instance
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

// 2. Connection Handling
io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 User connected: ${user.username} (${user.id}) - Socket ID: ${socket.id}`);

    // Add user to online list
    onlineUsers.set(user.id, socket.id);

    // Broadcast to all connected clients that this user came online
    io.emit('user_online', { userId: user.id, onlineUsers: Array.from(onlineUsers.keys()) });

    // Event: Client requests initial list of online users
    socket.on('get_online_users', () => {
        socket.emit('online_users_list', Array.from(onlineUsers.keys()));
    });

    // Handle Disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${user.username}`);
        onlineUsers.delete(user.id);

        // Broadcast to all remaining clients that this user went offline
        io.emit('user_offline', { userId: user.id, onlineUsers: Array.from(onlineUsers.keys()) });
    });
});

const PORT = process.env.PORT || 4002;

server.listen(PORT, () => {
    console.log(`🚀 Chat Service running on port ${PORT}`);
});