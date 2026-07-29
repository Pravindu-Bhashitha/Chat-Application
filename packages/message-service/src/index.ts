import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './router/message.routes';
import initSocketServer from './sockets/socketServer';
import { createInternalRouter } from './router/message.internal.route';

dotenv.config({ override: true });

const PORT = process.env.PORT || 4002;
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost'];

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

// initSocketServer(server);
const io = initSocketServer(server);

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/internal', createInternalRouter(io));

// app.listen(PORT, () => {
//   console.log(`🚀 Message Service running on port ${PORT}`);
// });
server.listen(PORT, () => {
  console.log(`🚀 Message Service running on port ${PORT}`);
});