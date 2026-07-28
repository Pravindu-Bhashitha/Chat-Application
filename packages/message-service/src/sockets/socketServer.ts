import http from 'http';
import { Server } from 'socket.io';
import handlePresenceEvents from './presenceHandler';
import dotenv from 'dotenv';
import handleMessageEvents from './messageHandler';
import socketAuthMiddleware from '../middleware/socketAuth.middleware';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '';

const initSocketServer = (server: http.Server): Server => {
  console.log(`Initializing Socket.io server with CORS origin: ${CLIENT_ORIGIN}`);
  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });
  
  io.use(socketAuthMiddleware);

  // Attach connection handlers
  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId}`);

    socket.join(userId);
    handlePresenceEvents(io, socket);
    handleMessageEvents(io, socket);
  });

  return io;
};

export default initSocketServer;