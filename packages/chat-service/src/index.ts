import express from 'express';
import http from 'http';
import cors from 'cors';
import initSocketServer from './sockets/socketServer';

const PORT = process.env.PORT || 4002;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Chat Service running on port ${PORT}`);
});