import { prisma } from "../config/prisma.config";
import { Prisma, PostType } from "@prisma/client";

export const historyService = {
  recordHistory: async (userId: string, postId: string) => {
    return prisma.history.create({
      data: {
        userId,
        postId,
        viewedAt: new Date(),
      },
    });
  },

  getUserHistories: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
    type?: PostType,
    categoryId?: string
  ) => {
    const skip = (page - 1) * limit;

    const wherePost: Prisma.PostWhereInput = {
      isDeleted: false,
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { excerpt: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        type ? { type: { equals: type } } : {},
        categoryId
          ? {
              categories: {
                some: { categoryId },
              },
            }
          : {},
      ],
    };

    const [totalItems, histories] = await Promise.all([
      prisma.history.count({
        where: { userId, post: wherePost },
      }),
      prisma.history.findMany({
        where: { userId, post: wherePost },
        skip,
        take: limit,
        orderBy: { viewedAt: "desc" },
        include: {
          post: {
            include: {
              categories: { include: { category: true } },
              images: true,
              author: {
                select: {
                  id: true,
                  fullname: true,
                  email: true,
                  avatar: true,
                },
              },
              masjidInfo: true,
            },
          },
        },
      }),
    ]);

    return {
      data: histories.map((h) => h.post),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + histories.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },
};
