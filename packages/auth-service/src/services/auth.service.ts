import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUserData, RegisterUserData } from '../types/user';
import * as authRepo from '../repository/auth.repository';
import { AppError } from '../utils/AppError';

export async function registerUser(data: RegisterUserData) {
  const existingUser = await authRepo.findUserByEmail(data.email) || await authRepo.findUserByUsername(data.username);

  if (existingUser) {
    throw new AppError('USER_EXISTS', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await authRepo.createUser({
    username: data.username,
    email: data.email,
    password: hashedPassword,
  });

  const MESSAGE_SERVICE_URL = process.env.MESSAGE_SERVICE_URL || 'http://localhost:4002';

  // Debug log to confirm which URL auth-service is hitting
  console.log(`📡 Sending user creation event to: ${MESSAGE_SERVICE_URL}/api/internal/user-created`);

  fetch(`${MESSAGE_SERVICE_URL}/api/internal/user-created`, {
    method: 'POST',
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
    console.error('⚠️ Failed to notify message-service of new user creation:', err.message);
  });

  return user;
}

export async function loginUser(data: LoginUserData) {
  const user = await authRepo.findUserByEmail(data.email);

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new AppError('INVALID_CREDENTIALS', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}
