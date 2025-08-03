import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.config";
import {
  UpdateUserPayload,
  UserDetail,
  UserListItem,
  PaginatedUserResponse,
} from "../types/user.types";

export const userService = {
  getUserProfile: async (userId: string): Promise<UserDetail | null> => {
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
        passwordHash: true,
      },
    });
  },

  getUsers: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedUserResponse> => {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              fullname: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const [totalItems, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
    ]);

    return {
      data: users as UserListItem[],
      paginations: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + users.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },

  getUserById: async (id: string): Promise<UserDetail | null> => {
    return prisma.user.findUnique({
      where: { id },
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
        passwordHash: true,
      },
    });
  },

  updateUser: async (
    id: string,
    data: UpdateUserPayload
  ): Promise<UserDetail> => {
    const updateData = {
      ...data,
      role: data.role as UserRole,
    };

    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  deleteUser: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
