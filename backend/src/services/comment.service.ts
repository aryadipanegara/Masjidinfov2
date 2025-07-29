import { prisma } from "../config/prisma.config";

export const commentService = {
  // Tambah komentar (top-level atau reply)
  createComment: async (
    content: string,
    userId: string,
    postId: string,
    parentId?: string
  ) => {
    return prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
        parentId: parentId ?? null,
      },
    });
  },

  // Ambil semua komentar untuk post (nested + author)
  getCommentsByPost: async (
    postId: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const skip = (page - 1) * limit;

    const [totalItems, comments] = await Promise.all([
      prisma.comment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
      prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: { id: true, fullname: true, avatar: true },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { id: true, fullname: true, avatar: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + comments.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },
  // Update komentar
  updateComment: async (commentId: string, userId: string, content: string) => {
    // Cek kepemilikan
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing || existing.authorId !== userId)
      throw new Error("Unauthorized");

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  },

  // Hapus komentar
  deleteComment: async (commentId: string, userId: string) => {
    // Cek kepemilikan
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing || existing.authorId !== userId)
      throw new Error("Unauthorized");

    return prisma.comment.delete({ where: { id: commentId } });
  },
};
