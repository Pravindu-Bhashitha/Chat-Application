import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import userService from '../user.service';
import * as userRepo from '../../repository/user.repository';
import { AppError } from '../../utils/AppError';

// Mock repository calls
jest.mock('../../repository/user.repository');
const mockedUserRepo = jest.mocked(userRepo);

describe('User Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return list of users excluding current user', async () => {
      const mockUsers = [
        { id: 'user-2', username: 'alice', email: 'alice@example.com', createdAt: new Date() },
      ];
      mockedUserRepo.findAllExcept.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers('user-1');

      expect(mockedUserRepo.findAllExcept).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUsers);
    });

    it('should throw AppError(400) if currentUserId is missing', async () => {
      await expect(userService.getAllUsers('')).rejects.toThrow(
        new AppError('Current User ID is required.', 400)
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if found', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'johndoe',
        email: 'john@example.com',
        createdAt: new Date(),
      };
      mockedUserRepo.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserProfile('user-1');

      expect(mockedUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw AppError(404) if user is not found', async () => {
      mockedUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getUserProfile('non-existent')).rejects.toThrow(
        new AppError('User not found.', 404)
      );
    });
  });

  describe('updateUserProfile', () => {
    const existingUser = {
      id: 'user-1',
      username: 'johndoe',
      email: 'john@example.com',
      createdAt: new Date(),
    };

    it('should successfully update user profile with new values', async () => {
      mockedUserRepo.findById.mockResolvedValue(existingUser);
      mockedUserRepo.findByUsernameOrEmail.mockResolvedValue([]);
      
      const updatedUser = {
        id: 'user-1',
        username: 'new_john',
        email: 'new_john@example.com',
        updatedAt: new Date(),
      };
      mockedUserRepo.updateProfile.mockResolvedValue(updatedUser);

      const result = await userService.updateUserProfile('user-1', {
        username: 'new_john',
        email: 'new_john@example.com',
      });

      expect(mockedUserRepo.updateProfile).toHaveBeenCalledWith('user-1', {
        username: 'new_john',
        email: 'new_john@example.com',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw AppError(409) if new username is already taken', async () => {
      mockedUserRepo.findById.mockResolvedValue(existingUser);
      mockedUserRepo.findByUsernameOrEmail.mockResolvedValue([
        { id: 'user-2', username: 'taken_username', email: 'other@example.com' },
      ]);

      await expect(
        userService.updateUserProfile('user-1', { username: 'taken_username' })
      ).rejects.toThrow(new AppError('Username is already taken.', 409));
    });

    it('should throw AppError(409) if new email is already in use', async () => {
      mockedUserRepo.findById.mockResolvedValue(existingUser);
      mockedUserRepo.findByUsernameOrEmail.mockResolvedValue([
        { id: 'user-2', username: 'otheruser', email: 'taken_email@example.com' },
      ]);

      await expect(
        userService.updateUserProfile('user-1', { email: 'taken_email@example.com' })
      ).rejects.toThrow(new AppError('Email is already in use.', 409));
    });
  });
});