import { PostType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export const readlistService = {
  createReadList: async (userId: string, name: string) => {
    return prisma.readList.create({
      data: { userId, name },
    });
  },

  getUserReadLists: async (userId: string) => {
    return prisma.readList.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  addPostToReadList: async (readListId: string, postId: string) => {
    return prisma.readListItem.create({
      data: { readListId, postId },
    });
  },

  removePostFromReadList: async (readListId: string, postId: string) => {
    return prisma.readListItem.delete({
      where: { readListId_postId: { readListId, postId } },
    });
  },

  getReadListPosts: async (
    readListId: string,
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

    const [totalItems, items] = await Promise.all([
      prisma.readListItem.count({
        where: {
          readListId,
          post: wherePost,
        },
      }),
      prisma.readListItem.findMany({
        where: {
          readListId,
          post: wherePost,
        },
        skip,
        take: limit,
        orderBy: { addedAt: "desc" },
        include: {
          post: {
            include: {
              categories: { include: { category: true } },
              author: {
                select: { id: true, fullname: true, email: true, avatar: true },
              },
              images: true,
              masjidInfo: true,
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((item) => item.post),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + items.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },
};
