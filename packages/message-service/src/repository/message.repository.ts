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

export async function getPaginatedConversation(
    user1Id: string,
    user2Id: string,
    limit: number = 20,
    beforeMessageId?: string
) {
    console.log(`Fetching paginated messages between ${user1Id} and ${user2Id} with limit ${limit} and beforeMessageId ${beforeMessageId}`);
    const whereCondition = {
        OR: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id },
        ],
    };

    const messages = await prisma.message.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' }, // Fetch newest first
        take: limit + 1, // Fetch 1 extra to check if more messages exist
        ...(beforeMessageId
            ? {
                cursor: { id: beforeMessageId },
                skip: 1, // Skip the cursor message itself
            }
            : {}),
    });
    console.log(`Fetched===>
 ${messages.length} messages (limit: ${limit}). Messages:`, messages.map(m => ({ id: m.id, content: m.content, createdAt: m.createdAt })));

    const hasMore = messages.length > limit;
    //   console.log(`Fetched ${messages.length} messages (limit: ${limit}). Has more: ${hasMore}`);
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    //   console.log('Fetched messages:', resultMessages.map(m => ({ id: m.id, content: m.content, createdAt: m.createdAt })));

    // Reverse back so client receives them in chronological order [old -> new]
    return {
        messages: resultMessages,
        hasMore,
    };
}