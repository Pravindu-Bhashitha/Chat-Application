import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function findAllExcept(currentUserId: string) {
    return await prisma.user.findMany({
        where: {
            id: { not: currentUserId },
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });
}

export async function findById(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });
}

export async function updateProfile(
    userId: string,
    data: { username?: string; email?: string }
) {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            ...data,
            updatedAt: new Date(),
        },
        select: {
            id: true,
            username: true,
            email: true,
            updatedAt: true,
        },
    });
}

export async function findByUsernameOrEmail(username?: string, email?: string) {
    if (!username && !email) return [];

    return await prisma.user.findMany({
        where: {
            OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : []),
            ],
        },
        select: {
            id: true,
            username: true,
            email: true,
        },
    });
}