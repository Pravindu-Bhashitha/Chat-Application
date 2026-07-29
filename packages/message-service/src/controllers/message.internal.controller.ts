import { Response } from 'express';
import { Server } from 'socket.io';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const notifyUserCreated = (io: Server) => {
  return (req: AuthenticatedRequest, res: Response) => {
    const { user } = req.body;
    console.log('Received user creation notification:', user);
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User data is required', statusCode: '400' });
    }

    io.emit('user:created', user);

    return res.status(200).json({ message: 'User broadcasted successfully', statusCode: '200' });
  };
};

export const notifyUserUpdated = (io: Server) => {
  return (req: AuthenticatedRequest, res: Response) => {
    const { user } = req.body;
    console.log('Received user update notification:', user);

    if (!user || !user.id) {
      return res.status(400).json({ error: 'User data is required', statusCode: '400' });
    }

    io.emit('user:updated', user);

    return res.status(200).json({ message: 'User update broadcasted successfully', statusCode: '200' });
  };
}