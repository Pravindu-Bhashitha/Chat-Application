import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { registerUser, loginUser } from '../auth.service';
import * as authRepo from '../../repository/auth.repository';
import { AppError } from '../../utils/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. Tell Jest to mock these modules
jest.mock('../../repository/auth.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// 2. Wrap mocked modules with jest.mocked() to retain full type inference
const mockedAuthRepo = jest.mocked(authRepo);
const mockedBcrypt = jest.mocked(bcrypt);
const mockedJwt = jest.mocked(jwt);

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const mockRegisterData = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'Password123!',
    };

    it('should register a new user successfully', async () => {
      // 🟢 Uses mockedAuthRepo & mockedBcrypt with proper type inference
      mockedAuthRepo.findUserByEmail.mockResolvedValue(null);
      mockedAuthRepo.findUserByUsername.mockResolvedValue(null);

      // Cast as Promise<string> to satisfy bcrypt overload signatures
      (mockedBcrypt.hash as unknown as jest.Mock).mockImplementation(() =>
        Promise.resolve('hashed_pwd_123')
      );

      const createdUser = {
        id: 'user-uuid-1',
        username: mockRegisterData.username,
        email: mockRegisterData.email,
      };
      mockedAuthRepo.createUser.mockResolvedValue(createdUser);

      const result = await registerUser(mockRegisterData);

      expect(mockedAuthRepo.findUserByEmail).toHaveBeenCalledWith(mockRegisterData.email);
      expect(mockedAuthRepo.createUser).toHaveBeenCalledWith({
        username: mockRegisterData.username,
        email: mockRegisterData.email,
        password: 'hashed_pwd_123',
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw AppError(USER_EXISTS, 409) if email already exists', async () => {
      mockedAuthRepo.findUserByEmail.mockResolvedValue({
        id: 'existing-1',
        username: 'old_user',
        email: 'john@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(registerUser(mockRegisterData)).rejects.toThrow(
        new AppError('USER_EXISTS', 409)
      );
      expect(mockedAuthRepo.createUser).not.toHaveBeenCalled();
    });

    it('should throw AppError(USER_EXISTS, 409) if username already exists', async () => {
      mockedAuthRepo.findUserByEmail.mockResolvedValue(null);
      mockedAuthRepo.findUserByUsername.mockResolvedValue({
        id: 'existing-2',
        username: 'john_doe',
        email: 'other@example.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(registerUser(mockRegisterData)).rejects.toThrow(
        new AppError('USER_EXISTS', 409)
      );
      expect(mockedAuthRepo.createUser).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    const mockLoginData = {
      email: 'john@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-uuid-1',
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashed_pwd_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return token and user object on successful login', async () => {
      mockedAuthRepo.findUserByEmail.mockResolvedValue(mockUser);

      (mockedBcrypt.compare as unknown as jest.Mock).mockImplementation(() =>
        Promise.resolve(true)
      );

      (mockedJwt.sign as unknown as jest.Mock).mockReturnValue('mocked_jwt_token');

      const result = await loginUser(mockLoginData);

      expect(mockedAuthRepo.findUserByEmail).toHaveBeenCalledWith(mockLoginData.email);
      expect(result).toEqual({
        token: 'mocked_jwt_token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });
    });

    it('should throw AppError(INVALID_CREDENTIALS, 401) if user is not found', async () => {
      mockedAuthRepo.findUserByEmail.mockResolvedValue(null);

      await expect(loginUser(mockLoginData)).rejects.toThrow(
        new AppError('INVALID_CREDENTIALS', 401)
      );
    });

    it('should throw AppError(INVALID_CREDENTIALS, 401) if password does not match', async () => {
      mockedAuthRepo.findUserByEmail.mockResolvedValue(mockUser);

      (mockedBcrypt.compare as unknown as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );

      await expect(loginUser(mockLoginData)).rejects.toThrow(
        new AppError('INVALID_CREDENTIALS', 401)
      );
    });
  });
});