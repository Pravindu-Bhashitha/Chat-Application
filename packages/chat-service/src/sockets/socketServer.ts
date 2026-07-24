import http from 'http';
import { Server } from 'socket.io';
import handlePresenceEvents from './presenceHandler';
import socketAuthMiddleware from '../middleware/socketAuth.middleware';
import dotenv from 'dotenv';
import handleMessageEvents from './messageHandler';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '';

const initSocketServer = (server: http.Server): Server => {
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
    // Join a room named with the user's ID for direct messaging
    socket.join(userId);
    handlePresenceEvents(io, socket);
    handleMessageEvents(io, socket);
  });

  return io;
};

export default initSocketServer;