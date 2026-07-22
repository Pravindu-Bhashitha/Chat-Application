import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const messageService = {
  async createMessage(senderId: string, receiverId: string, content: string) {
    return await prisma.message.create({
      data: { senderId, receiverId, content },
    });
  },

  async getConversation(user1Id: string, user2Id: string) {
    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};

export default messageService;