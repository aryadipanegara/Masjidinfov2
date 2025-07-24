import { prisma } from "../config/prisma.config";
import { Prisma, PostType } from "@prisma/client";
import { CreatePostPayload } from "../types/posts.types";

export const postService = {
  getPosts: async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    type?: PostType,
    categoryId?: string
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      isDeleted: false,
      AND: [
        search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  excerpt: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  content: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }
          : {},
        type ? { type: { equals: type } } : {},
        categoryId
          ? {
              categories: {
                some: {
                  categoryId,
                },
              },
            }
          : {},
      ],
    };

    const [totalItems, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
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
      }),
    ]);

    return {
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: skip + posts.length < totalItems,
        hasPrevPage: page > 1,
      },
    };
  },

  getPostById: async (id: string) => {
    return prisma.post.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
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
    });
  },

  getPostBySlug: async (slug: string) => {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
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
    });
  },

  createPost: async (data: CreatePostPayload, authorId: string) => {
    const {
      title,
      slug,
      content,
      type,
      excerpt,
      tags,
      coverImage,
      categoryIds,
      imageIds,
    } = data;

    return prisma.post.create({
      data: {
        title,
        slug,
        content,
        type,
        excerpt,
        tags,
        coverImage,
        authorId,
        categories: categoryIds
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: imageIds
          ? {
              connect: imageIds.map((imageId) => ({ id: imageId })),
            }
          : undefined,
      },
    });
  },

  updatePostBySlug: async (slug: string, data: Partial<CreatePostPayload>) => {
    const {
      title,
      slug: newSlug,
      content,
      type,
      excerpt,
      tags,
      coverImage,
      categoryIds,
      imageIds,
    } = data;

    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) throw new Error("Post tidak ditemukan");

    await prisma.postCategory.deleteMany({ where: { postId: post.id } });

    return prisma.post.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        content,
        type,
        excerpt,
        tags,
        coverImage,
        categories: categoryIds
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: imageIds
          ? {
              connect: imageIds.map((imageId) => ({ id: imageId })),
            }
          : undefined,
      },
    });
  },

  updatePost: async (id: string, data: Partial<CreatePostPayload>) => {
    const {
      title,
      slug,
      content,
      type,
      excerpt,
      tags,
      coverImage,
      categoryIds,
      imageIds,
    } = data;

    await prisma.postCategory.deleteMany({ where: { postId: id } });

    return prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        type,
        excerpt,
        tags,
        coverImage,
        categories: categoryIds
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: imageIds
          ? {
              connect: imageIds.map((imageId) => ({ id: imageId })),
            }
          : undefined,
      },
    });
  },

  deletePost: async (id: string) => {
    return prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });
  },
};
