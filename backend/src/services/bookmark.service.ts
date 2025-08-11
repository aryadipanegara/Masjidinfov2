import { prisma } from "../config/prisma.config";
import { Prisma, PostType } from "@prisma/client";

export const bookmarkService = {
  addBookmark: async (userId: string, postId: string) => {
    return prisma.$transaction([
      prisma.bookmark.create({
        data: { userId, postId },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);
  },

  removeBookmark: async (userId: string, postId: string) => {
    return prisma.$transaction(async (tx) => {
      const deletedBookmark = await tx.bookmark.delete({
        where: {
          userId_postId: { userId, postId },
        },
        select: { id: true },
      });

      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { bookmarkCount: true },
      });

      if (post && post.bookmarkCount > 0) {
        await tx.post.update({
          where: { id: postId },
          data: { bookmarkCount: { decrement: 1 } },
        });
      }

      return deletedBookmark;
    });
  },

  isBookmarked: async (userId: string, postId: string) => {
    return prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
  },

  getUserBookmarks: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
    type?: PostType,
    categoryId?: string
  ) => {
    const skip = (page - 1) * limit;

    const andConditions: Prisma.PostWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (type) {
      andConditions.push({ type: { equals: type } });
    }

    if (categoryId) {
      andConditions.push({
        categories: {
          some: { categoryId },
        },
      });
    }

    const wherePost: Prisma.PostWhereInput = {
      isDeleted: false,
      AND: andConditions.length > 0 ? andConditions : undefined,
    };

    const [totalItems, bookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: { userId, post: wherePost },
      }),
      prisma.bookmark.findMany({
        where: { userId, post: wherePost },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
            },
          },
        },
      }),
    ]);

    return {
      data: bookmarks.map((b) => b.post),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + bookmarks.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },
  hasBookmarked: async (userId: string, postId: string) => {
    const count = await prisma.bookmark.count({
      where: { userId, postId },
    });
    return count > 0;
  },
};
