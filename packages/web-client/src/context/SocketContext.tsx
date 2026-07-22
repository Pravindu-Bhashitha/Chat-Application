import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: string[];
  fetchOnlineUsers: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: [],
  fetchOnlineUsers: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

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

    // Listen for real-time online status changes
    newSocket.on('user_online', ({ onlineUsers }: { onlineUsers: string[] }) => {
      setOnlineUserIds(onlineUsers);
    });

    newSocket.on('user_offline', ({ onlineUsers }: { onlineUsers: string[] }) => {
      setOnlineUserIds(onlineUsers);
    });

    setSocket(newSocket);

    // Cleanup connection on unmount / logout
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const fetchOnlineUsers = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('get_online_users');
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds, fetchOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};