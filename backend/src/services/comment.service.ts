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
    userId?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const skip = (page - 1) * limit;

    const [totalItems, comments] = await Promise.all([
      prisma.comment.count({ where: { postId, parentId: null } }),
      prisma.comment.findMany({
        where: { postId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              fullname: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  fullname: true,
                  avatar: true,
                },
              },
              _count: {
                select: { likes: true },
              },
            },
          },
        },
      }),
    ]);

    // Tambahkan isLiked status jika user login
    let likedMap: Record<string, boolean> = {};

    if (userId) {
      const likedComments = await prisma.commentLike.findMany({
        where: {
          userId,
          commentId: {
            in: comments.map((c) => c.id),
          },
        },
        select: { commentId: true },
      });

      likedMap = likedComments.reduce((acc, curr) => {
        acc[curr.commentId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }

    const enriched = comments.map((c) => ({
      ...c,
      isLiked: likedMap[c.id] || false,
      totalLikes: c._count.likes,
      totalReplies: c._count.replies,
      replies: c.replies.map((r) => ({
        ...r,
        totalLikes: r._count.likes,
      })),
    }));

    return {
      data: enriched,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + enriched.length < totalItems,
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

  likeComment: async (commentId: string, userId: string) => {
    return prisma.commentLike.upsert({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
      update: {},
      create: {
        commentId,
        userId,
      },
    });
  },

  // 👎 Unlike comment
  unlikeComment: async (commentId: string, userId: string) => {
    return prisma.commentLike.delete({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
  },

  // 🔢 Count likes
  getCommentLikeCount: async (commentId: string) => {
    return prisma.commentLike.count({
      where: { commentId },
    });
  },

  // ✅ Check if user liked
  hasUserLikedComment: async (commentId: string, userId: string) => {
    const like = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
    return !!like;
  },
};
