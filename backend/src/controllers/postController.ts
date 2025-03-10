import { Request, Response, NextFunction } from "express";
import { postService } from "../services/postService";

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);

    if (!post) {
      res.status(404).json({ error: "Post tidak ditemukan" });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id; // ID pengguna dari token JWT
    const { title, content, image } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title dan Content harus diisi" });
      return;
    }

    const newPost = await postService.createPost(userId, {
      title,
      content,
      image,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id; // ID pengguna dari token JWT
    const { id } = req.params;
    const { title, content, image } = req.body;

    const updatedPost = await postService.updatePost(id, userId, {
      title,
      content,
      image,
    });

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id; // ID pengguna dari token JWT
    const { id } = req.params;

    await postService.deletePost(id, userId);

    res.json({ message: "Post berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
