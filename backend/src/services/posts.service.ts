import { prisma } from "../config/prisma.config";
import { Prisma, PostType, PostStatus } from "@prisma/client";
import { CreatePostPayload, GetPostsOptions } from "../types/posts.types";
import { extractImagesFromContent } from "../utils/imageExtractor.utils";

export const postService = {
  getPosts: async (opts: GetPostsOptions) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      type,
      categoryId,
      showAll = false,
      status = PostStatus.PUBLISHED,
    } = opts;

    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      ...(showAll ? {} : { isDeleted: false, status }),

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
              categories: { some: { categoryId } },
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
        orderBy: [{ viewCount: "desc" }, { bookmarks: { _count: "desc" } }],
        include: {
          categories: { include: { category: true } },
          images: true,
          author: {
            select: { id: true, fullname: true, email: true, avatar: true },
          },
          _count: { select: { bookmarks: true } },
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
      },
    });
  },

  getPostBySlug: async (slug: string) => {
    const post = await prisma.post.findUnique({
      where: { slug, isDeleted: false },
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
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    prisma.post
      .update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        console.error(
          "Failed to increment viewCount for post slug:",
          slug,
          err
        );
      });

    return post;
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
      status,
    } = data;

    const extractedImages = extractImagesFromContent(content);

    let allImageConnections: { id: string }[] = [];

    if (imageIds && imageIds.length > 0) {
      allImageConnections = imageIds.map((imageId) => ({ id: imageId }));
    }

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
        status: status ?? "DRAFT",
        categories: categoryIds
          ? {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: {
          ...(allImageConnections.length > 0 && {
            connect: allImageConnections,
          }),
          create: extractedImages.map((img, index) => ({
            url: img.url,
            altText: img.altText || null,
            caption: img.caption || null,
            order: index,
          })),
        },
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
      status,
    } = data;

    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) throw new Error("Post tidak ditemukan");

    const extractedImages = content ? extractImagesFromContent(content) : [];

    let allImageConnections: { id: string }[] = [];

    if (imageIds && imageIds.length > 0) {
      allImageConnections = imageIds.map((imageId) => ({ id: imageId }));
    }

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
        status: status ?? "DRAFT",
        categories: categoryIds
          ? {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: {
          deleteMany: {},
          ...(allImageConnections.length > 0 && {
            connect: allImageConnections,
          }),
          // Create images yang diekstrak dari content
          create: extractedImages.map((img, index) => ({
            url: img.url,
            altText: img.altText || null,
            caption: img.caption || null,
            order: index,
          })),
        },
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
      status,
    } = data;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) throw new Error("Post tidak ditemukan");

    const extractedImages = content ? extractImagesFromContent(content) : [];

    let allImageConnections: { id: string }[] = [];

    if (imageIds && imageIds.length > 0) {
      allImageConnections = imageIds.map((imageId) => ({ id: imageId }));
    }

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
        status: status ?? "DRAFT",
        categories: categoryIds
          ? {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
        images: {
          deleteMany: {},
          ...(allImageConnections.length > 0 && {
            connect: allImageConnections,
          }),
          create: extractedImages.map((img, index) => ({
            url: img.url,
            altText: img.altText || null,
            caption: img.caption || null,
            order: index,
          })),
        },
      },
    });
  },

  softDeletePost: async (postId: string) => {
    return prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }),
      prisma.image.updateMany({
        where: { postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }),
    ]);
  },

  restorePost: async (postId: string) => {
    return prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: { isDeleted: false, deletedAt: null },
      }),
      prisma.image.updateMany({
        where: { postId },
        data: { isDeleted: false, deletedAt: null },
      }),
    ]);
  },
};
