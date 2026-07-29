import { messageApi } from "../axiosInstance";

export const messageService = {
    getConversation: async (userId: string) => {
        const response = await messageApi.get(`/${userId}`);
        if (!response) {
            throw new Error('Failed to fetch conversation');
        }
        return response.data;
    },
    saveConversation: async (senderId: string, receiverId: string, content: string) => {
        const response = await messageApi.post('/', { senderId, receiverId, content });
        console.log('Message sent:', response);
        if (!response) {
            throw new Error('Failed to save message');
        }
        return response.data;
    },
    getRecentConversations: async () => {
        const response = await messageApi.get('/recent');
        console.log('Recent conversations fetched:', response);
        if (!response) {
            throw new Error('Failed to fetch recent conversations');
        }
        return response.data;
    },

    getUnreadCounts: async () => {
        const response = await messageApi.get('/unread-counts');
        console.log('Unread counts fetched:', response);
        return response.data;
    },

    markAsRead: async (senderId: string) => {
        const response = await messageApi.patch(`/read/${senderId}`);
        return response.data;
    },

    uploadMedia: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await messageApi.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response) {
            throw new Error('Failed to upload file');
        }

        return response.data; // returns { mediaUrl, type, originalName, size }
    },
};