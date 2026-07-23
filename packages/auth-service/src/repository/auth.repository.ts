import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: { username: string; email: string; password: string }) {
  return await prisma.user.create({
    data,
    select: { id: true, username: true, email: true },
  });
}

export async function findAllUsers() {
  return await prisma.user.findMany({
    select: { id: true, username: true, email: true },
  });
}