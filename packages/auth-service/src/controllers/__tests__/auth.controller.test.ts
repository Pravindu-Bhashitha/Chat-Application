import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';
import * as authService from '../../services/auth.service';
import { AppError } from '../../utils/AppError';

// Mock the auth service 
jest.mock('../../services/auth.service');
const mockedAuthService = jest.mocked(authService);

// Set up a lightweight Express server for Supertest
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Controller (HTTP Endpoints)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should return 201 Created and user data on successful registration', async () => {
      const mockCreatedUser = {
        id: 'user-123',
        username: 'johndoe',
        email: 'john@example.com',
      };

      mockedAuthService.registerUser.mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreatedUser);
    });

    it('should return 400 Bad Request if mandatory fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ username: 'johndoe', email: 'john@example.com' }); 

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'All fields are required',
        statusCode: 400,
      });
      expect(mockedAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict if user already exists', async () => {
      mockedAuthService.registerUser.mockRejectedValue(
        new AppError('USER_EXISTS', 409)
      );

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'USER_EXISTS',
        statusCode: 409,
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 OK with auth token on successful login', async () => {
      const mockAuthData = {
        token: 'mock-jwt-token',
        user: { id: 'user-123', username: 'johndoe', email: 'john@example.com' },
      };

      mockedAuthService.loginUser.mockResolvedValue(mockAuthData);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAuthData);
    });

    it('should return 400 Bad Request if email or password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email and password are required',
        statusCode: 400,
      });
      expect(mockedAuthService.loginUser).not.toHaveBeenCalled();
    });

    it('should return 401 Unauthorized on invalid credentials', async () => {
      mockedAuthService.loginUser.mockRejectedValue(
        new AppError('INVALID_CREDENTIALS', 401)
      );

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });
  });
});