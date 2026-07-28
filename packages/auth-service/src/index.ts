import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config({ override: true });

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = [
                process.env.FRONTEND_URL,
                process.env.NGROK_URL,
            ].filter(Boolean);

            if (!origin || allowed.includes(origin))
                return callback(null, true);

            callback(
                new Error(
                    "CORS_BLOCKED"
                )
            );
        },
        credentials: true,
    })
);


app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));