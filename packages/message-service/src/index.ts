import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './router/message.routes';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Message Service running on port ${PORT}`);
});