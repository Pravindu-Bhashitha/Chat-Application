import api from "../axiosInstance";

export const messageService = {
    getConversation: async (userId: string) => {
        const response = await api.get(`/messages/${userId}`);
        if (!response) {
            throw new Error('Failed to fetch conversation');
        }
        return response.data;
    }
};