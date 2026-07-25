import { Response } from 'express';
import userService from '../services/user.service';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }

    const users = await userService.getAllUsers(currentUserId);
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to fetch users', statusCode: 500 });
  }
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }
    const profile = await userService.getUserProfile(userId);
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to fetch profile', statusCode: 500 });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token', statusCode: 401 });
    }
    const { username, email } = req.body;
    console.log('Updating profile for userId:', userId, 'with data:', { username, email });

    const updatedProfile = await userService.updateUserProfile(userId, {
      username, email
    });
    console.log('Profile updated successfully for userId:', userId, 'Updated data:', updatedProfile);

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to update profile', statusCode: 500 });
  }
};