import prisma from "../prisma/prismaClient";

export const createComment = async (data: {
  desc: string;
  userId: string;
  postId: string;
  parentId?: string;
}) => {
  return await prisma.comment.create({
    data,
  });
};

export const getCommentById = async (id: string) => {
  return await prisma.comment.findUnique({
    where: { id },
    include: { replies: true },
  });
};

export const getCommentsByPostId = async (postId: string) => {
  return await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: { replies: true },
  });
};

export const updateComment = async (id: string, data: { desc: string }) => {
  return await prisma.comment.update({
    where: { id },
    data,
  });
};

export const deleteComment = async (id: string) => {
  return await prisma.comment.delete({
    where: { id },
  });
};
