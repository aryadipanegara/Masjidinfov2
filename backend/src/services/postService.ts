import prisma from "../prisma/prismaClient";
import { Post, Prisma } from "@prisma/client";

export const createPost = async (
  postData: Prisma.PostCreateInput
): Promise<Post> => {
  const post = await prisma.post.create({
    data: postData,
  });
  return post;
};
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { user: true, comments: true },
  });
  return post; // Pastikan ini mengembalikan tipe yang benar
};
export const updatePost = async (
  id: string,
  postData: Prisma.PostUpdateInput
) => {
  return await prisma.post.update({
    where: { id },
    data: postData,
  });
};

export const deletePost = async (id: string) => {
  return await prisma.post.delete({ where: { id } });
};

export const getAllPosts = async (status?: string) => {
  return await prisma.post.findMany({
    where: status ? { status } : undefined,
    include: { user: true },
  });
};
