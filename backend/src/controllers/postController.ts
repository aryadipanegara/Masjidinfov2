import { Request, Response } from "express";
import {
  createPost,
  getPostBySlug,
  updatePost,
  deletePost,
  getAllPosts,
} from "../services/postService";
import { errorResponse, successResponse } from "../utils/responseUtil";

export const createPostHandler = async (req: Request, res: Response) => {
  try {
    const { title, image, slug, desc, content, isFeatured, status } = req.body;
    const userId = (req as any).user.id;

    if (!userId) {
      return errorResponse(
        res,
        "Akses di tolak. Hanya admin yang diizinkan",
        "Bad Request",
        400
      );
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

    return successResponse(res, post, "Post berhasil dibuat", 201);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat membuat post",
      "Bad Request",
      400
    );
  }
};

export const getPostBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return errorResponse(res, "Post tidak ditemukan", "Not Found", 404);
    }

    return successResponse(res, post, "Post retrieved successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengambil post",
      "Bad Request",
      400
    );
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    const post = await updatePost(id, postData);
    return successResponse(res, post, "Post updated successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengupdate post",
      "Bad Request",
      400
    );
  }
};

export const deletePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deletePost(id);
    return successResponse(res, null, "Post deleted successfully", 204);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat menghapus post",
      "Bad Request",
      400
    );
  }
};

export const getAllPostsHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const posts = await getAllPosts(status as string);
    return successResponse(res, posts, "Posts retrieved successfully", 200);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengambil post",
      "Bad Request",
      400
    );
  }
};
