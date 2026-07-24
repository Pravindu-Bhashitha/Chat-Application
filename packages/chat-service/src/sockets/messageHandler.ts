import { Server, Socket } from 'socket.io';
import { getConversationId } from '../utils/conversationId';

export interface MessageData {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp?: string;
    conversationId?: string;
}

const handleMessageEvents = (io: Server, socket: Socket) => {
    const user = socket.data.user; // Authenticated user from socketAuth middleware

    // Event: Client sends a direct message
    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
        const { receiverId, content } = data;

        if (!content || !receiverId) {
            return;
        }

        const response = await fetch('http://localhost:4003/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: user.id,
                receiverId,
                content,
                conversationId: getConversationId(user.id, receiverId),
            }),
        });

        const savedMessage = await response.json();

        const messagePayload: MessageData = {
            senderId: user.id,
            receiverId,
            content,
            conversationId: getConversationId(user.id, receiverId),
            timestamp: savedMessage.createdAt || new Date().toISOString(),
        };

        console.log(`📩 Message from ${user.username} to ${receiverId}: "${content}"`);

        io.to(receiverId).emit('receive_message', messagePayload);
        socket.emit('receive_message', messagePayload);
    });
};

export default handleMessageEvents;