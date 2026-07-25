import * as userRepo from '../repository/user.repository';
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
    updateData: { username?: string; status?: string; avatarUrl?: string }
  ) {
    if (!userId) {
      throw new AppError('User ID is required.', 400);
    }

    const existingUser = await userRepo.findById(userId);
    if (!existingUser) {
      throw new AppError('User not found.', 404);
    }

    // Prepare cleaned payload
    const payloadToUpdate: Record<string, string> = {};
    if (updateData.username?.trim()) {
      payloadToUpdate.username = updateData.username.trim();
    }

    return await userRepo.updateProfile(userId, payloadToUpdate);
  },
};

export default userService;