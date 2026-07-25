import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import messageService from '../services/message.service';
import { AppError } from '../utils/AppError';
import { stat } from 'fs';

export const saveMessageController = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields', statusCode: 400 });
    }

    const message = await messageService.createMessage(senderId, receiverId, content);
    res.status(201).json({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      conversationId: message.conversationId,
      content: message.content,
      isRead: message.isRead,
      timestamp: message.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    console.error('Save message error:', error);
    return res.status(500).json({ error: 'Failed to save message', statusCode: 500 });
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
      conversationId: m.conversationId,
      content: m.content,
      isRead: m.isRead,
      timestamp: m.createdAt.toISOString(),
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Get conversation error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to fetch conversation history', statusCode: 500 });
  }
};

export const getRecentConversationsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log("Fetching recent conversations for user:", userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required', statusCode: 400 });
    }

    const recentConversations = await messageService.getRecentConversations(userId);
    console.log("Recent Conversations:==>", recentConversations);


    const formattedConversations = recentConversations.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      conversationId: m.conversationId,
      content: m.content,
      isRead: m.isRead,
      timestamp: m.createdAt.toISOString(),
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get recent conversations error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to fetch recent conversations', statusCode: 500 });
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Logged-in user (Receiver)
    const { senderId } = req.params;     // Active chat user (Sender)

    if (!userId || !senderId) {
      return res.status(400).json({ error: 'User ID is required', statusCode: 400 });
    }

    const result = await messageService.markConversationAsRead(senderId, userId);

    return res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    console.error('Mark as read error:', error);
    return res.status(500).json({ error: 'Failed to mark messages as read', statusCode: 500 });
  }
};

export const getUnreadCounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required', statusCode: 400 });
    }

    const unreadCounts = await messageService.getUnreadMessageCounts(userId);

    return res.json(unreadCounts);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    console.error('Get unread counts error:', error);
    return res.status(500).json({ error: 'Failed to fetch unread counts', statusCode: 500 });
  }
};