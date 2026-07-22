export type PresenceStatus = 'Available' | 'Away' | 'Busy' | 'Offline';

export interface User {
  id: string;
  username: string;
  email: string;
  status?: PresenceStatus;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  delivered: boolean;
  read: boolean;
  createdAt: string;
}

export interface SocketMessagePayload {
  recipientId: string;
  content: string;
}

export interface SocketPresencePayload {
  status: PresenceStatus;
}