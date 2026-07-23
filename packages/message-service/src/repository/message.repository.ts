import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createMessage(senderId: string, receiverId: string, content: string) {
  return await prisma.message.create({
    data: { senderId, receiverId, content },
  });
}

export async function getConversation(user1Id: string, user2Id: string) {
  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}