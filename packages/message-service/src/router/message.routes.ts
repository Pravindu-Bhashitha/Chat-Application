import { Router } from 'express';
import { saveMessageController,  getRecentConversationsController, getConversationController, getUnreadCounts, markMessagesAsRead, uploadMediaController } from '../controllers/message.controller';
import authenticateToken from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/upload', authenticateToken, upload.single('file'), uploadMediaController);

// Internal/HTTP POST route to save message
router.post('/', authenticateToken, saveMessageController);

// Authenticated GET route for chat history
router.get('/recent', authenticateToken, getRecentConversationsController);

router.get('/unread-counts', authenticateToken, getUnreadCounts);

router.patch('/read/:senderId', authenticateToken, markMessagesAsRead);

router.get('/:otherUserId', authenticateToken, getConversationController);


export default router;