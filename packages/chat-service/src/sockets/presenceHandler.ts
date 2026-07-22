import { Server, Socket } from 'socket.io';

// Map to track connected users: userId -> socketId
const onlineUsers = new Map<string, string>();

const handlePresenceEvents = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  console.log(`🔌 User connected: ${user.username} (${user.id}) - Socket ID: ${socket.id}`);

  // Add user to online map
  onlineUsers.set(user.id, socket.id);

  // Broadcast presence update to everyone
  io.emit('user_online', {
    userId: user.id,
    onlineUsers: Array.from(onlineUsers.keys()),
  });

  // Client explicitly requests initial list
  socket.on('get_online_users', () => {
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${user.username} (${user.id})`);
    onlineUsers.delete(user.id);

    io.emit('user_offline', {
      userId: user.id,
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
};

export default handlePresenceEvents;