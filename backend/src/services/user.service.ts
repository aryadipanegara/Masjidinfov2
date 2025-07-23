import { prisma } from "../config/prisma.config";

export const userService = {
  getUserProfile: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        avatar: true,
        isVerified: true,
        hasGoogleAccount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
