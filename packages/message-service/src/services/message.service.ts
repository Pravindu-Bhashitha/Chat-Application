import { PrismaClient } from '@prisma/client';
import * as messageRepo from '../repository/message.repository';

const prisma = new PrismaClient();

const messageService = {
  async createMessage(senderId: string, receiverId: string, content: string) { 
    return await messageRepo.createMessage(senderId, receiverId, content);
  },

  async getConversation(user1Id: string, user2Id: string) {
    return await messageRepo.getConversation(user1Id, user2Id);
  },

  async getPaginatedMessages(
    user1Id: string,
    user2Id: string,
    limit: number = 20,
    beforeMessageId?: string
  ) {
    console.log(`Fetching paginated messages for ${user1Id} and ${user2Id}`);
    console.log(`Limit: ${limit}, Before Message ID: ${beforeMessageId}`);
    console.log(`Fetching paginated messages for ${user1Id} and ${user2Id}`);
    console.log(`Limit: ${limit}, Before Message ID: ${beforeMessageId}`);
    return await messageRepo.getPaginatedConversation(user1Id, user2Id, limit, beforeMessageId);

  }
};

export default messageService;