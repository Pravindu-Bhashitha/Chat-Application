import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './router/user.router';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 4003;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});