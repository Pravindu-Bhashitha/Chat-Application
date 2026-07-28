import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import messageService from '../message.service';
import * as messageRepo from '../../repository/message.repository';
import { AppError } from '../../utils/AppError';

jest.mock('../../repository/message.repository');
const mockedMessageRepo = jest.mocked(messageRepo);

describe('Message Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create and return a message when valid parameters are provided', async () => {
      const mockMessage = {
        id: 'msg-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        conversationId: 'user-1_user-2',
        content: 'Hello World',
        type: 'TEXT' as const,
        mediaUrl: null,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedMessageRepo.createMessage.mockResolvedValue(mockMessage);

      const result = await messageService.createMessage({
        senderId: 'user-1',
        receiverId: 'user-2',
        content: '  Hello World  ',
      });

      expect(mockedMessageRepo.createMessage).toHaveBeenCalledWith({
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello World',
        type: 'TEXT',
        mediaUrl: undefined,
      });
      expect(result).toEqual(mockMessage);
    });

    it('should throw AppError(400) if content is empty or whitespace', async () => {
      await expect(
        messageService.createMessage({
          senderId: 'user-1',
          receiverId: 'user-2',
          content: '   ',
        })
      ).rejects.toThrow(
        new AppError('Sender, receiver, and message content/attachment are required.', 400)
      );
    });
  });

  describe('getConversation', () => {
    it('should retrieve conversation history between two users', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          conversationId: 'user-1_user-2',
          content: 'Hi',
          type: 'TEXT' as const,
          mediaUrl: null,
          isRead: true,
          readAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedMessageRepo.getConversation.mockResolvedValue(mockMessages);

      const result = await messageService.getConversation('user-1', 'user-2');

      expect(mockedMessageRepo.getConversation).toHaveBeenCalledWith('user-1', 'user-2');
      expect(result).toEqual(mockMessages);
    });

    it('should throw AppError(400) if either user ID is missing', async () => {
      await expect(messageService.getConversation('user-1', '')).rejects.toThrow(
        new AppError('Both user IDs are required to fetch a conversation.', 400)
      );
    });
  });

  describe('getRecentConversations', () => {
    it('should return recent conversations for a user', async () => {
      const mockRecent = [
        {
          id: 'msg-2',
          senderId: 'user-2',
          receiverId: 'user-1',
          conversationId: 'user-1_user-2',
          content: 'Latest message',
          type: 'TEXT' as const,
          mediaUrl: null,
          isRead: false,
          readAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedMessageRepo.getRecentConversations.mockResolvedValue(mockRecent);

      const result = await messageService.getRecentConversations('user-1');

      expect(mockedMessageRepo.getRecentConversations).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockRecent);
    });

    it('should throw AppError(400) if userId is missing', async () => {
      await expect(messageService.getRecentConversations('')).rejects.toThrow(
        new AppError('User ID is required.', 400)
      );
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark messages as read and return updated count', async () => {
      mockedMessageRepo.markAsRead.mockResolvedValue({ count: 5 });

      const result = await messageService.markConversationAsRead('sender-1', 'receiver-1');

      expect(mockedMessageRepo.markAsRead).toHaveBeenCalledWith('sender-1', 'receiver-1');
      expect(result).toEqual({ updatedCount: 5, success: true });
    });

    it('should throw AppError(400) if missing parameters', async () => {
      await expect(messageService.markConversationAsRead('', 'receiver-1')).rejects.toThrow(
        new AppError('Sender ID and Receiver ID are required.', 400)
      );
    });
  });

  describe('getUnreadMessageCounts', () => {
    it('should format raw unread count arrays into a key-value map', async () => {
      const mockRawCounts = [
        { senderId: 'user-A', _count: { id: 3 } },
        { senderId: 'user-B', _count: { id: 1 } },
      ];

      mockedMessageRepo.getUnreadCountsBySender.mockResolvedValue(mockRawCounts as never);

      const result = await messageService.getUnreadMessageCounts('receiver-1');

      expect(mockedMessageRepo.getUnreadCountsBySender).toHaveBeenCalledWith('receiver-1');
      expect(result).toEqual({
        'user-A': 3,
        'user-B': 1,
      });
    });

    it('should throw AppError(400) if receiverId is missing', async () => {
      await expect(messageService.getUnreadMessageCounts('')).rejects.toThrow(
        new AppError('Receiver ID is required.', 400)
      );
    });
  });
});