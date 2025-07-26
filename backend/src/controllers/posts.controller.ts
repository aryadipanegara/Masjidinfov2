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
  try {
    const authorId = (req as any).user?.userId;

    if (!authorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const post = await postService.createPost(req.body, authorId);
    res.status(201).json(post);
  } catch (error: any) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: error.message || "Failed to create post" });
  }
};

export const updatePostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = req.body;

    const updated = await postService.updatePostBySlug(slug, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating post by slug:", error);

    if (error.message === "Post tidak ditemukan") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || "Failed to update post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await postService.updatePost(id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating post:", error);

    if (error.message === "Post tidak ditemukan") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || "Failed to update post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  await postService.deletePost(id);
  res.status(204).end();
};
