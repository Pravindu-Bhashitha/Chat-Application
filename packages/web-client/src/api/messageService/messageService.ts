import { messageApi } from "../axiosInstance";

export const messageService = {
    getConversation: async (userId: string) => {
        const response = await messageApi.get(`/messages/${userId}`);
        if (!response) {
            throw new Error('Failed to fetch conversation');
        }
        return response.data;
    },
    saveConversation: async (senderId: string, receiverId: string, content: string) => {
        const response = await messageApi.post('/messages', { senderId, receiverId, content });
        console.log('Message sent:', response);
        if (!response) {
            throw new Error('Failed to save message');
        }
        return response.data;
    },
    getRecentConversations: async () => {
        const response = await messageApi.get('/messages/recent');
        console.log('Recent conversations fetched:', response);
        if (!response) {
            throw new Error('Failed to fetch recent conversations');
        }
        return response.data;
    },
    // 🆕 Fetch unread message counts
    getUnreadCounts: async () => {
        const response = await messageApi.get('/messages/unread-counts');
        console.log('Unread counts fetched:', response);
        return response.data; // Returns { [senderId]: number }
    },

    // 🆕 Mark messages from a specific user as read
    markAsRead: async (senderId: string) => {
        const response = await messageApi.patch(`/messages/read/${senderId}`);
        return response.data;
    },
};