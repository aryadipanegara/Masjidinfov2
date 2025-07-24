import { Request, Response } from "express";
import { postService } from "../services/posts.service";
import { PostType } from "@prisma/client";

export const getPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = req.query.type as PostType | undefined;
  const categoryId = req.query.categoryId as string | undefined;

  const result = await postService.getPosts(
    page,
    limit,
    search,
    type,
    categoryId
  );
  res.json(result);
};

export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postService.getPostById(id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
};

export const getPostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const post = await postService.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error getting post by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const authorId = (req as any).user?.userId;
  const post = await postService.createPost(req.body, authorId);
  res.status(201).json(post);
};

export const updatePostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = req.body;

  try {
    const updated = await postService.updatePostBySlug(slug, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating post by slug:", error);
    res.status(404).json({ error: error.message || "Post tidak ditemukan" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postService.updatePost(id, req.body);
  res.json(post);
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  await postService.deletePost(id);
  res.status(204).end();
};
