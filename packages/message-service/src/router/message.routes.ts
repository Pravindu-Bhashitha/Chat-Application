import { Router } from 'express';
import { saveMessageController,  getRecentConversationsController, getConversationController } from '../controllers/message.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

// Internal/HTTP POST route to save message
router.post('/', authenticateToken, saveMessageController);

// Authenticated GET route for chat history
router.get('/recent', authenticateToken, getRecentConversationsController);

router.get('/:otherUserId', authenticateToken, getConversationController);



export default router;