import { Request, Response } from "express";
import {
  createPost,
  getPostBySlug,
  updatePost,
  deletePost,
  getAllPosts,
} from "../services/postService";

export const createPostHandler = async (req: Request, res: Response) => {
  try {
    const { title, image, slug, desc, content, isFeatured, status } = req.body;
    const userId = (req as any).user.id;

    if (!userId) {
      res
        .status(400)
        .json({ error: "Akses ditolak. Hanya admin yang diizinkan" });
      return;
    }

    const post = await createPost({
      title,
      image,
      slug,
      desc,
      content,
      isFeatured,
      status,
      user: { connect: { id: userId } },
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPostBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await getPostBySlug(slug);

    if (!post) {
      res.status(404).json({ error: "Post tidak ditemukan" });
      return;
    }

    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    const post = await updatePost(id, postData);
    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deletePost(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllPostsHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const posts = await getAllPosts(status as string);
    res.json(posts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
