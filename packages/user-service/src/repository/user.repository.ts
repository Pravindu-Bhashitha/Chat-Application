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
    data: { username?: string; status?: string; }
) {
    return await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            username: true,
            email: true,
            updatedAt: true,
        },
    });
}