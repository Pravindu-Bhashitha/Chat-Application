// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();

// export class AuthService {
//   static async registerUser(data: { username: string; email: string; password: string }) {
//     const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
//     if (existingUser) {
//       throw new Error('USER_EXISTS');
//     }

//     const hashedPassword = await bcrypt.hash(data.password, 10);
//     const user = await prisma.user.create({
//       data: {
//         username: data.username,
//         email: data.email,
//         password: hashedPassword,
//       },
//       select: { id: true, username: true, email: true },
//     });

//     return user;
//   }

//   static async loginUser(data: { email: string; password: string }) {
//     const user = await prisma.user.findUnique({ where: { email: data.email } });
//     if (!user) {
//       throw new Error('INVALID_CREDENTIALS');
//     }

//     const isMatch = await bcrypt.compare(data.password, user.password);
//     if (!isMatch) {
//       throw new Error('INVALID_CREDENTIALS');
//     }

//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       process.env.JWT_SECRET || 'secret',
//       { expiresIn: '1d' }
//     );

//     return {
//       token,
//       user: { id: user.id, username: user.username, email: user.email },
//     };
//   }

//   static async getAllUsers() {
//     return prisma.user.findMany({
//       select: { id: true, username: true, email: true },
//     });
//   }
// }
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUserData, RegisterUserData } from '../types/user';
import * as authRepo from '../repository/auth.repository';
import { AppError } from '../utils/AppError';

// const prisma = new PrismaClient();

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

export async function getAllUsers() {
  return await authRepo.findAllUsers();
}