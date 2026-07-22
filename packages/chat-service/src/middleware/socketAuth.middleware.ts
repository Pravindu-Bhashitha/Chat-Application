import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export interface DecodedToken {
  id: string;
  username?: string;
}

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded || !decoded.id) {
      console.error('❌ Token verified, but userId missing:', decoded);
      return next(new Error('Authentication error: Invalid payload'));
    }

    socket.data.user = {
      id: decoded.id,
      username: decoded.username || 'User',
    };
    next();
  } catch (err) {
    console.error('❌ JWT Verification Failed:', err);
    next(new Error('Authentication error: Invalid token'));
  }
};

export default socketAuthMiddleware;