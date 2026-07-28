import { Server, Socket } from 'socket.io';
import { getConversationId } from '../utils/conversationId';
import messageService from '../services/message.service';
import { MessageData } from '../types';

const handleMessageEvents = (io: Server, socket: Socket) => {
    const user = socket.data.user; 

    console.log("socket", socket.data)

    // Event: Client sends a direct message
    socket.on('send_message', async (data: { receiverId: string; content: string; type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO'; mediaUrl?: string }) => {
       const { receiverId, content, type, mediaUrl } = data;

        if (!content || !receiverId || (!content.trim() && !mediaUrl)) {
            return;
        }

        const savedMessage = await messageService.createMessage({senderId: user.id, receiverId, content, type, mediaUrl});

        console.log('Saved message:', savedMessage);

        const messagePayload: MessageData = {
            senderId: user.id,
            receiverId,
            content,
            conversationId: getConversationId(user.id, receiverId),
            timestamp: savedMessage.createdAt
                ? new Date(savedMessage.createdAt).toISOString()
                : new Date().toISOString(),
            mediaUrl: mediaUrl || undefined,
            type: type || 'TEXT'
        };

        console.log(`Message from ${user.username} to ${receiverId}: "${content}"`);

        io.to(receiverId).emit('receive_message', messagePayload);
        socket.emit('receive_message', messagePayload);
    });
    socket.on('mark_as_read', ({ senderId }: { senderId: string }) => {
        console.log(`User ${user.id} is marking messages from ${senderId} as read`);
        if (!senderId) return;

        console.log(`User ${user.id} read messages sent by ${senderId}`);

        // Notify the original sender that this user has read their messages
        io.to(senderId).emit('messages_read', {
            readByUserId: user.id,
        });
    });
};

export default handleMessageEvents;