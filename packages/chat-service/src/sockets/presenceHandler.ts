import { Server, Socket } from 'socket.io';

export type StatusType = 'Available' | 'Away' | 'Busy' | 'Offline';

interface UserPresence {
  status: StatusType;
  customNote?: string;
}

// Map to track connected users: userId -> socketId
const userPresenceMap = new Map<string, UserPresence>();

const handlePresenceEvents = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  console.log(`🔌 User connected: ${user.username} (${user.id}) - Socket ID: ${socket.id}`);

  // 1. Set default status on connection if not present
  if (!userPresenceMap.has(user.id)) {
    userPresenceMap.set(user.id, { status: 'Available' });
  } else {
    // If reconnecting, set back to Available
    const current = userPresenceMap.get(user.id)!;
    current.status = 'Available';
  }
  
  const getPresencesPayload = () => Object.fromEntries(userPresenceMap);
  const getOnlineUserIds = () => Array.from(userPresenceMap.keys()).filter(
    (id) => userPresenceMap.get(id)?.status !== 'Offline'
  );

  // Broadcast presence update to everyone
  io.emit('user_online', {
    userId: user.id,
    onlineUsers: getOnlineUserIds(),
    presences: getPresencesPayload(),
  });

  // Client explicitly requests initial list
  socket.on('get_online_users', () => {
    socket.emit('online_users_list', getOnlineUserIds());
    socket.emit('get_all_presences', getPresencesPayload());
  });

  socket.on('update_presence', ({ status, customNote }: { status: StatusType; customNote?: string }) => {
    userPresenceMap.set(user.id, { status, customNote });

    // Broadcast status change to everyone
    io.emit('presence_changed', {
      userId: user.id,
      status,
      customNote,
      presences: getPresencesPayload(),
    });
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${user.username} (${user.id})`);

    // Mark user status as Offline
    userPresenceMap.set(user.id, { status: 'Offline' });

    io.emit('user_offline', {
      userId: user.id,
      onlineUsers: getOnlineUserIds(),
      presences: getPresencesPayload(),
    });
  });

};

export default handlePresenceEvents;