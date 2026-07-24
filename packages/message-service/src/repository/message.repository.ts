import { PrismaClient } from "@prisma/client";
import { getConversationId } from "../utils/conversationId";

const prisma = new PrismaClient();

// export async function createMessage(senderId: string, receiverId: string, content: string) {
//   return await prisma.message.create({
//     data: { senderId, receiverId, content },
//   });
// }

// export async function getConversation(user1Id: string, user2Id: string) {
//   return await prisma.message.findMany({
//     where: {
//       OR: [
//         { senderId: user1Id, receiverId: user2Id },
//         { senderId: user2Id, receiverId: user1Id },
//       ],
//     },
//     orderBy: { createdAt: "asc" },
//   });
// }

export async function createMessage(senderId: string, receiverId: string, content: string) {
  const conversationId = getConversationId(senderId, receiverId);
  console.log("Conversation ID:", conversationId); 
  return await prisma.message.create({
    data: {
      senderId,
      receiverId,
      conversationId,
      content,
    },
  });
}

export async function getConversation(user1Id: string, user2Id: string) {
  const conversationId = getConversationId(user1Id, user2Id);
  console.log("Fetching conversation for ID:", conversationId);

  return await prisma.message.findMany({
    where: { conversationId},
    orderBy: { createdAt: 'asc' },
  });
}