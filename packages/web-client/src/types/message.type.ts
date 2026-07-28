export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId?: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
  mediaUrl?: string;
  isRead: boolean;
  timestamp: string;
}