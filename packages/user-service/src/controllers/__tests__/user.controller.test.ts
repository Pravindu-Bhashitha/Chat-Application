import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import userService from '../../services/user.service';
import { AppError } from '../../utils/AppError';
import userRoutes from '../../router/user.router';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';


// Mock auth middleware so it attaches a dummy user to req.user
jest.mock('../../middleware/auth.middleware', () => {
  return jest.fn((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).user = { id: 'user-123' };
    next();
  });
});

// Mock user service
jest.mock('../../services/user.service');
const mockedUserService = jest.mocked(userService);

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Controller HTTP Endpoints', () => {
  beforeAll(() => {
    // Quiet down expected error logs during negative testing
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return 200 OK with user list', async () => {
      const mockUsers = [{ id: 'user-456', username: 'alice', email: 'alice@example.com' }];
      mockedUserService.getAllUsers.mockResolvedValue(mockUsers as never);

      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(mockedUserService.getAllUsers).toHaveBeenCalledWith('user-123');
    });
  });

  describe('GET /users/me', () => {
    it('should return 200 OK with authenticated user profile', async () => {
      const mockProfile = { id: 'user-123', username: 'testuser', email: 'test@example.com' };
      mockedUserService.getUserProfile.mockResolvedValue(mockProfile as never);

      const res = await request(app).get('/users/me');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfile);
      expect(mockedUserService.getUserProfile).toHaveBeenCalledWith('user-123');
    });

    it('should return 404 if profile is not found', async () => {
      mockedUserService.getUserProfile.mockRejectedValue(new AppError('User not found.', 404));

      const res = await request(app).get('/users/me');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found.', statusCode: 404 });
    });
  });

  describe('PATCH /users/update-profile', () => {
    it('should return 200 OK with updated profile', async () => {
      const updatedData = { id: 'user-123', username: 'newname', email: 'new@example.com' };
      mockedUserService.updateUserProfile.mockResolvedValue(updatedData as never);

      const res = await request(app)
        .patch('/users/update-profile')
        .send({ username: 'newname', email: 'new@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedData);
    });

    it('should return 409 Conflict if username is taken', async () => {
      mockedUserService.updateUserProfile.mockRejectedValue(
        new AppError('Username is already taken.', 409)
      );

      const res = await request(app)
        .patch('/users/update-profile')
        .send({ username: 'taken_user' });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Username is already taken.', statusCode: 409 });
    });
  });
});