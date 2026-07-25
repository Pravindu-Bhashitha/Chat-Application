import { Router } from 'express';
import { saveMessageController,  getRecentConversationsController, getConversationController, getUnreadCounts, markMessagesAsRead } from '../controllers/message.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

// Internal/HTTP POST route to save message
router.post('/', authenticateToken, saveMessageController);

// Authenticated GET route for chat history
router.get('/recent', authenticateToken, getRecentConversationsController);

router.get('/:otherUserId', authenticateToken, getConversationController);

router.get('/unread-counts', authenticateToken, getUnreadCounts);
router.patch('/read/:senderId', authenticateToken, markMessagesAsRead);


export default router;