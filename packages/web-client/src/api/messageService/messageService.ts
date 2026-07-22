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
    }
};