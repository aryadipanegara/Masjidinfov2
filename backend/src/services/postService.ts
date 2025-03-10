import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const postService = {
  async getAllPosts() {
    return await prisma.post.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        comments: true,
      },
    });
  },

  async getPostById(id: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        comments: true,
      },
    });
  },

  async createPost(
    userId: string,
    data: { title: string; content: string; image?: string }
  ) {
    return await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        image: data.image,
        slug: data.title.toLowerCase().replace(/ /g, "-"),
        userId,
      },
    });
  },

  async updatePost(
    id: string,
    userId: string,
    data: { title?: string; content?: string; image?: string }
  ) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new Error("Post tidak ditemukan");
    }

    if (post.userId !== userId) {
      throw new Error("Anda tidak memiliki izin untuk mengedit post ini");
    }

    return await prisma.post.update({
      where: { id },
      data,
    });
  },

  async deletePost(id: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new Error("Post tidak ditemukan");
    }

    if (post.userId !== userId) {
      throw new Error("Anda tidak memiliki izin untuk menghapus post ini");
    }

    return await prisma.post.delete({
      where: { id },
    });
  },
};
