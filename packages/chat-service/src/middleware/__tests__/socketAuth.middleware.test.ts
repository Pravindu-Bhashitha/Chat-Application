import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import socketAuthMiddleware from '../socketAuth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Socket Auth Middleware Unit Tests', () => {
  let mockSocket: any;
  let nextFn: jest.Mock;

  beforeEach(() => {
    mockSocket = {
      handshake: {
        auth: {},
      },
      data: {},
    };
    nextFn = jest.fn();
  });

  it('should pass authentication and attach user data if valid token provided', () => {
    const validToken = jwt.sign({ id: 'user-100', username: 'alice' }, JWT_SECRET);
    mockSocket.handshake.auth.token = validToken;

    socketAuthMiddleware(mockSocket, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
    expect(mockSocket.data.user).toEqual({
      id: 'user-100',
      username: 'alice',
    });
  });

  it('should default username to "User" if missing from token payload', () => {
    const tokenNoUsername = jwt.sign({ id: 'user-101' }, JWT_SECRET);
    mockSocket.handshake.auth.token = tokenNoUsername;

    socketAuthMiddleware(mockSocket, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
    expect(mockSocket.data.user).toEqual({
      id: 'user-101',
      username: 'User',
    });
  });

  it('should fail authentication with error if token is missing', () => {
    socketAuthMiddleware(mockSocket, nextFn);

    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    const error = (nextFn as jest.Mock).mock.calls[0][0] as Error;
    expect(error.message).toBe('Authentication error: Token missing');
  });

  it('should fail authentication if token is invalid or expired', () => {
    mockSocket.handshake.auth.token = 'invalid-token-string';

    socketAuthMiddleware(mockSocket, nextFn);

    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    const error = (nextFn as jest.Mock).mock.calls[0][0] as Error;
    expect(error.message).toBe('Authentication error: Invalid token');
  });

  it('should fail authentication if token lacks user id', () => {
    const tokenWithoutId = jwt.sign({ role: 'admin' }, JWT_SECRET);
    mockSocket.handshake.auth.token = tokenWithoutId;

    socketAuthMiddleware(mockSocket, nextFn);

    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    const error = (nextFn as jest.Mock).mock.calls[0][0] as Error;
    expect(error.message).toBe('Authentication error: Invalid payload');
  });
});