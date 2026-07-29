import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './router/message.routes';
import initSocketServer from './sockets/socketServer';
import { createInternalRouter } from './router/message.internal.routes';

dotenv.config({ override: true });

const PORT = process.env.PORT || 4002;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const server = http.createServer(app);

// initSocketServer(server);
const io = initSocketServer(server);

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/internal', createInternalRouter(io));

server.listen(PORT, () => {
  console.log(`🚀 Message Service running on port ${PORT}`);
});