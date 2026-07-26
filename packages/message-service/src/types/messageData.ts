export interface MessageData {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
  mediaUrl?: string;
  timestamp: string;
  conversationId: string;
  isRead?: boolean;
}