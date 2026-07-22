import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import messageService from './services/message.service';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 4003;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: string;
    timestamp?: string;
}

// Endpoint 1: Save message (Internal call from chat-service OR HTTP client)
app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const message = await messageService.createMessage(senderId, receiverId, content);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Endpoint 2: Fetch Chat History for Web Client
app.get('/api/messages/:otherUserId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const messages = await messageService.getConversation(decoded.id, req.params.otherUserId);

        const formattedMessages = messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            receiverId: m.receiverId,
            content: m.content,
            timestamp: m.createdAt.toString(),
        }));

        res.json(formattedMessages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Message Service running on port ${PORT}`);
});