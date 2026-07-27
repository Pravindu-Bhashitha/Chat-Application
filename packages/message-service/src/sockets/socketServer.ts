import http from 'http';
import { Server } from 'socket.io';
import handlePresenceEvents from './presenceHandler';
import dotenv from 'dotenv';
import handleMessageEvents from './messageHandler';
import socketAuthMiddleware from '../middleware/socketAuth.middleware';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost'];

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
    console.log(`User connected: ${userId}`);

    socket.join(userId);
    handlePresenceEvents(io, socket);
    handleMessageEvents(io, socket);
  });

  return io;
};

export default initSocketServer;