import * as messageRepo from '../repository/message.repository';
import { CreateMessageData } from '../types';
import { AppError } from '../utils/AppError';

const messageService = {
  async createMessage(data: CreateMessageData) {
    const { senderId, receiverId, content, type = 'TEXT', mediaUrl } = data;

    const trimmedContent = content ? content.trim() : '';

    if (!senderId || !receiverId || (!content.trim() && !mediaUrl)) {
      throw new AppError('Sender, receiver, and message content/attachment are required.', 400);
    }
    return await messageRepo.createMessage({senderId, receiverId, content: trimmedContent, type, mediaUrl});
  },

  async getConversation(user1Id: string, user2Id: string) {
    if (!user1Id || !user2Id) {
      throw new AppError('Both user IDs are required to fetch a conversation.', 400);
    }
    return await messageRepo.getConversation(user1Id, user2Id);
  },

  async getRecentConversations(userId: string) {
    if (!userId) {
      throw new AppError('User ID is required.', 400);
    }
    return await messageRepo.getRecentConversations(userId);
  },

  markConversationAsRead: async (senderId: string, receiverId: string) => {
    if (!senderId || !receiverId) {
      throw new AppError('Sender ID and Receiver ID are required.', 400);
    }

    const result = await messageRepo.markAsRead(senderId, receiverId);

    return {
      updatedCount: result.count,
      success: true,
    };
  },

  getUnreadMessageCounts: async (receiverId: string) => {
    if (!receiverId) {
      throw new AppError('Receiver ID is required.', 400);
    }
    const rawCounts = await messageRepo.getUnreadCountsBySender(receiverId);

    const unreadMap: Record<string, number> = {};

    rawCounts.forEach((item) => {
      unreadMap[item.senderId] = item._count.id;
    });

    return unreadMap;
  },
};

export default messageService;