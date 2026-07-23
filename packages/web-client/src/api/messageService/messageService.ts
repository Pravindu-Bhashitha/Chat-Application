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
    getPaginatedMessages: async (targetUserId: string,limit: number = 20,beforeMessageId?: string) => {
        const params: Record<string, any> = { limit };
        if (beforeMessageId) {
            params.before = beforeMessageId;
        }

        // GET /api/messages/paginated/TARGET_USER_ID?limit=20&before=XYZ
        const response = await messageApi.get(`/messages/paginated/${targetUserId}`, { params });

        if (!response) {
            throw new Error('Failed to fetch paginated messages');
        }
        return response.data;
    }
};