import { Router } from 'express';
import { saveMessageController, getConversationController } from '../controllers/message.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

// Internal/HTTP POST route to save message
router.post('/', authenticateToken, saveMessageController);

// Authenticated GET route for chat history
router.get('/:otherUserId', authenticateToken, getConversationController);

export default router;