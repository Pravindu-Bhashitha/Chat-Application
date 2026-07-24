import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type StatusType = 'Available' | 'Away' | 'Busy' | 'Offline';

// interface SocketContextType {
//   socket: Socket | null;
//   onlineUserIds: string[];
//   fetchOnlineUsers: () => void;
// }

export interface UserPresence {
  status: StatusType;
  customNote?: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: string[];
  presences: Record<string, UserPresence>;
  updateStatus: (status: StatusType, customNote?: string) => void;
  fetchOnlineUsers: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: [],
  presences: {},
  updateStatus: () => { },
  fetchOnlineUsers: () => { },
});
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});

  const token = localStorage.getItem('token');

  useEffect(() => {

    // if (!token) return;
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Chat Service WebSocket server (Port 4002)
    const newSocket = io('http://localhost:4002', {
      auth: { token },
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to WebSocket Server');
      // Ask for initial online users list
      newSocket.emit('get_online_users');
    });

    // Listen for initial online user list
    newSocket.on('online_users_list', (users: string[]) => {
      setOnlineUserIds(users);
    });

    // Listen for initial full presences map
    newSocket.on('get_all_presences', (presencesData: Record<string, UserPresence>) => {
      setPresences(presencesData);
    });

    // Listen for real-time presence changes
    newSocket.on('presence_changed', ({ userId, status, customNote, presences: updatedPresences }) => {
      if (updatedPresences) {
        setPresences(updatedPresences);
      } else {
        setPresences((prev) => ({
          ...prev,
          [userId]: { status, customNote },
        }));
      }
    });

    // Listen for real-time online status changes
    newSocket.on('user_online', (data: { onlineUsers: string[]; presences?: Record<string, UserPresence> }) => {
      setOnlineUserIds(data.onlineUsers);
      if (data.presences) setPresences(data.presences);
    });

    newSocket.on('user_offline', (data: { onlineUsers: string[]; presences?: Record<string, UserPresence> }) => {
      setOnlineUserIds(data.onlineUsers);
      if (data.presences) setPresences(data.presences);
    });

    setSocket(newSocket);

    // Cleanup connection on unmount / logout
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const updateStatus = useCallback(
    (status: StatusType, customNote?: string) => {
      if (socket && socket.connected) {
        socket.emit('update_presence', { status, customNote });
      }
    },
    [socket]
  );

  const fetchOnlineUsers = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('get_online_users');
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUserIds,
      presences,
      updateStatus,
      fetchOnlineUsers,
    }}>
      {children}
    </SocketContext.Provider>
  );
};