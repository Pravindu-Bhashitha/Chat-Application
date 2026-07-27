import { PrismaClient } from "@prisma/client";
import { getConversationId } from "../utils/conversationId";

const prisma = new PrismaClient();

export async function createMessage(data: { senderId: string; receiverId: string; content: string; type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO'; mediaUrl?: string }) {
  const { senderId, receiverId, content, type = 'TEXT', mediaUrl } = data;
  const conversationId = getConversationId(senderId, receiverId);
  console.log("Conversation ID:", conversationId); 
  return await prisma.message.create({
    data: {
      senderId,
      receiverId,
      conversationId,
      content,
      type,
      mediaUrl,
    },
  });
}

export async function getConversation(user1Id: string, user2Id: string) {
  const conversationId = getConversationId(user1Id, user2Id);

  return await prisma.message.findMany({
    where: { conversationId},
    orderBy: { createdAt: 'asc' },
  });
}

export async function getRecentConversations(userId: string) {
  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: [
      { conversationId: 'asc' },
      { createdAt: 'desc' }
    ],
    distinct: ['conversationId']
  });
}

export async function markAsRead(senderId: string, receiverId: string) {
  return await prisma.message.updateMany({
    where: {
      senderId: senderId,
      receiverId: receiverId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function getUnreadCountsBySender(receiverId: string) {
  return await prisma.message.groupBy({
    by: ['senderId'],
    where: {
      receiverId: receiverId,
      isRead: false,
    },
    _count: {
      id: true,
    },
  });
}