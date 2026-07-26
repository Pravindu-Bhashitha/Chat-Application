import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express, { Response, NextFunction } from 'express';
import messageService from '../../services/message.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import messageRoutes from '../../router/message.routes';

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => {
    return jest.fn((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        req.user = { id: 'user-123' };
        next();
    });
});

// Mock message service
jest.mock('../../services/message.service');
const mockedMessageService = jest.mocked(messageService);

const app = express();
app.use(express.json());
app.use('/messages', messageRoutes);

describe('Message Controller HTTP Endpoints', () => {
    const mockDate = new Date('2026-01-01T10:00:00.000Z');

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /messages (saveMessageController)', () => {
        it('should create message and return 201 Created', async () => {
            const mockMessage = {
                id: 'msg-1',
                senderId: 'user-123',
                receiverId: 'user-456',
                conversationId: 'user-123_user-456',
                content: 'Hey there!',
                isRead: false,
                createdAt: mockDate,
            };

            mockedMessageService.createMessage.mockResolvedValue(mockMessage as never);

            const res = await request(app)
                .post('/messages')
                .send({ senderId: 'user-123', receiverId: 'user-456', content: 'Hey there!' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                id: 'msg-1',
                senderId: 'user-123',
                receiverId: 'user-456',
                conversationId: 'user-123_user-456',
                content: 'Hey there!',
                isRead: false,
                timestamp: mockDate.toISOString(),
            });
        });

        it('should return 400 Bad Request if body fields are missing', async () => {
            const res = await request(app)
                .post('/messages')
                .send({ senderId: 'user-123' });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Missing required fields', statusCode: 400 });
        });
    });

    describe('GET /messages/recent (getRecentConversationsController)', () => {
        it('should return recent conversations with formatted timestamp', async () => {
            const mockConversations = [
                {
                    id: 'msg-1',
                    senderId: 'user-456',
                    receiverId: 'user-123',
                    conversationId: 'user-123_user-456',
                    content: 'Hello!',
                    isRead: false,
                    createdAt: mockDate,
                },
            ];

            mockedMessageService.getRecentConversations.mockResolvedValue(mockConversations as never);

            const res = await request(app).get('/messages/recent');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    id: 'msg-1',
                    senderId: 'user-456',
                    receiverId: 'user-123',
                    conversationId: 'user-123_user-456',
                    content: 'Hello!',
                    isRead: false,
                    timestamp: mockDate.toISOString(),
                },
            ]);
            expect(mockedMessageService.getRecentConversations).toHaveBeenCalledWith('user-123');
        });
    });

    describe('GET /messages/:otherUserId (getConversationController)', () => {
        it('should return message history between two users', async () => {
            const mockConversation = [
                {
                    id: 'msg-1',
                    senderId: 'user-123',
                    receiverId: 'other-999',
                    conversationId: 'other-999_user-123',
                    content: 'Hi',
                    isRead: true,
                    createdAt: mockDate,
                },
            ];

            mockedMessageService.getConversation.mockResolvedValue(mockConversation as never);

            const res = await request(app).get('/messages/other-999');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    id: 'msg-1',
                    senderId: 'user-123',
                    receiverId: 'other-999',
                    conversationId: 'other-999_user-123',
                    content: 'Hi',
                    isRead: true,
                    timestamp: mockDate.toISOString(),
                },
            ]);
            expect(mockedMessageService.getConversation).toHaveBeenCalledWith('user-123', 'other-999');
        });
    });

    describe('GET /messages/unread-counts (getUnreadCounts)', () => {
        it('should return unread counts grouped by sender', async () => {
            const mockUnreadMap = { 'sender-1': 2, 'sender-2': 5 };
            mockedMessageService.getUnreadMessageCounts.mockResolvedValue(mockUnreadMap);

            const res = await request(app).get('/messages/unread-counts');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUnreadMap);
            expect(mockedMessageService.getUnreadMessageCounts).toHaveBeenCalledWith('user-123');
        });
    });

    describe('PATCH /messages/read/:senderId (markMessagesAsRead)', () => {
        it('should mark messages as read and return updated count payload', async () => {
            const mockResponse = { updatedCount: 4, success: true };
            mockedMessageService.markConversationAsRead.mockResolvedValue(mockResponse);

            const res = await request(app).patch('/messages/read/sender-888');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockResponse);
            expect(mockedMessageService.markConversationAsRead).toHaveBeenCalledWith('sender-888', 'user-123');
        });
    });
});