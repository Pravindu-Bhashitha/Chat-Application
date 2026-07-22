import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  onlineUserIds: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUserIds: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Chat Service WebSocket server (Port 4002)
    const newSocket = io('http://localhost:4002', {
      auth: { token },
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
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};