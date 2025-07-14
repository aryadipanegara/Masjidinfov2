// services/postService.ts
import prisma from "../prisma/client";
import { PostType } from "@prisma/client";

export interface CreatePostDto {
  type: PostType;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  categoryIds: string[];
}

export class PostService {
  /**
   * Buat post baru + relasi ke kategori lewat join model
   */
  static async createPost(dto: CreatePostDto, authorId: string) {
    return prisma.post.create({
      data: {
        type: dto.type,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        tags: dto.tags,
        author: { connect: { id: authorId } },
        categories: {
          // buat PostCategory rows yang menghubungkan post baru & kategori
          create: dto.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        author: true,
        categories: { include: { category: true } },
      },
    });
  }

  /**
   * Ambil semua post (non-deleted)
   */
  static async getAllPosts() {
    return prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        categories: { include: { category: true } },
      },
    });
  }

  /**
   * Detail post per slug
   */
  static async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true } },
        categories: { include: { category: true } },
        images: true,
      },
    });
    if (!post || post.isDeleted) return null;
    return post;
  }

  /**
   * Update post + kategori
   */
  static async updatePost(id: string, dto: Partial<CreatePostDto>) {
    const data: any = { ...dto, updatedAt: new Date() };

    if (dto.categoryIds) {
      // Hapus semua relasi PostCategory lama, lalu recreate
      data.categories = {
        deleteMany: {},
        create: dto.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    return prisma.post.update({
      where: { id },
      data,
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });
  }

  /**
   * Soft-delete post
   */
  static async deletePost(id: string) {
    return prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
