import http from 'http';
import { Server } from 'socket.io';
import handlePresenceEvents from './presenceHandler';
import socketAuthMiddleware from '../middleware/socketAuth.middleware';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '';

const initSocketServer = (server: http.Server): Server => {
    const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });
  // Attach auth middleware
  io.use(socketAuthMiddleware);

  // Attach connection handlers
  io.on('connection', (socket) => {
    handlePresenceEvents(io, socket);
    // Future handlers (e.g., handleMessageEvents) will go here!
  });

  return io;
};

export default initSocketServer;