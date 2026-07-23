import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import messageService from '../services/message.service';

export const saveMessageController = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = await messageService.createMessage(senderId, receiverId, content);
    res.status(201).json(message);
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
};

export const getConversationController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId || !otherUserId) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    const messages = await messageService.getConversation(userId, otherUserId);

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
};