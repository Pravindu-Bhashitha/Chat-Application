import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }

    const users = await userService.getAllUsers(currentUserId);
    return res.status(200).json(users);
  } catch (error) {
    next(error); 
  }
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }
    const profile = await userService.getUserProfile(userId);
    return res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }
    const { username, status, avatarUrl } = req.body;

    const updatedProfile = await userService.updateUserProfile(userId, {
      username,
      status,
      avatarUrl,
    });

    return res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};