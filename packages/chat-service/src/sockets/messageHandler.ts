import { Server, Socket } from 'socket.io';

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: string;
}

const handleMessageEvents = (io: Server, socket: Socket) => {
  const user = socket.data.user; // Authenticated user from socketAuth middleware

  // Event: Client sends a direct message
  socket.on('send_message', (data: { receiverId: string; content: string }) => {
    const { receiverId, content } = data;

    if (!content || !receiverId) {
      return;
    }

    const messagePayload: MessageData = {
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    };

    console.log(`📩 Message from ${user.username} to ${receiverId}: "${content}"`);

    // Broadcast message to the intended recipient and echo back to sender
    // Note: If users are joined in rooms by their userId, we can emit directly to their room!
    io.to(receiverId).emit('receive_message', messagePayload);
    socket.emit('receive_message', messagePayload);
  });
};

export default handleMessageEvents;