import * as userRepo from '../repository/user.repository';
import { UpdateUserProfileData } from '../types/UpdateProfile';
import { AppError } from '../utils/AppError';

const userService = {
  async getAllUsers(currentUserId: string) {
    if (!currentUserId) {
      throw new AppError('Current User ID is required.', 400);
    }
    return await userRepo.findAllExcept(currentUserId);
  },

  async getUserProfile(userId: string) {
    if (!userId) {
      throw new AppError('User ID is required.', 400);
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  },

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileData
  ) {
    if (!userId) {
      throw new AppError('User ID is required.', 400);
    }

    const existingUser = await userRepo.findById(userId);
    if (!existingUser) {
      throw new AppError('User not found.', 404);
    }

    const cleanUsername = updateData.username?.trim();
    const cleanEmail = updateData.email?.trim();

    const isUsernameChanged = cleanUsername && cleanUsername !== existingUser.username;
    const isEmailChanged = cleanEmail && cleanEmail !== existingUser.email;

    const conflictingUsers = await userRepo.findByUsernameOrEmail(
      isUsernameChanged ? cleanUsername : undefined,
      isEmailChanged ? cleanEmail : undefined
    );

    for (const conflict of conflictingUsers) {
      if (conflict.id !== userId) {
        if (isUsernameChanged && conflict.username === cleanUsername) {
          throw new AppError('Username is already taken.', 409);
        }
        if (isEmailChanged && conflict.email === cleanEmail) {
          throw new AppError('Email is already in use.', 409);
        }
      }
    }

    const payloadToUpdate: Record<string, string> = {};
    if (isUsernameChanged) payloadToUpdate.username = cleanUsername!;
    if (isEmailChanged) payloadToUpdate.email = cleanEmail!;

    const user = await userRepo.updateProfile(userId, payloadToUpdate);
    console.log('User profile updated:', user);

    const MESSAGE_SERVICE_URL = process.env.MESSAGE_SERVICE_URL || 'http://localhost:4002';

    // Fire-and-forget native fetch call
    fetch(`${MESSAGE_SERVICE_URL}/api/internal/user-updated`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      }),
    }).catch((err) => {
      console.error('⚠️ Failed to notify message-service of user update:', err.message);
    });

    return user;
  },
};

export default userService;