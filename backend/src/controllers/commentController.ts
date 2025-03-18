import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseUtil";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPostId,
  updateComment,
} from "../services/commentService";

export const createCommentHandler = async (req: Request, res: Response) => {
  try {
    const { desc, postId, parentId } = req.body;
    const userId = (req as any).user.id;

    if (!desc || !postId) {
      return errorResponse(
        res,
        "Deskripsi dan PostId harus diisi",
        "Bad Request",
        400
      );
    }

    const comment = await createComment({ desc, userId, postId, parentId });

    return successResponse(res, comment, "Comment berhasil dibuat", 201);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat membuat komentar",
      "Bad Request",
      400
    );
  }
};

// Mendapatkan komentar berdasarkan ID
export const getCommentByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ambil komentar
    const comment = await getCommentById(id);

    // Jika komentar tidak ditemukan
    if (!comment) {
      return errorResponse(res, "Komentar tidak ditemukan", "Not Found", 404);
    }

    // Respons sukses
    return successResponse(res, comment, "Comment retrieved successfully");
  } catch (error: any) {
    // Respons error
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengambil komentar",
      "Bad Request",
      400
    );
  }
};

// Mendapatkan semua komentar untuk sebuah post
export const getCommentsByPostIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { postId } = req.params;

    // Ambil komentar
    const comments = await getCommentsByPostId(postId);

    // Respons sukses
    return successResponse(res, comments, "Comments retrieved successfully");
  } catch (error: any) {
    // Respons error
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengambil komentar",
      "Bad Request",
      400
    );
  }
};

// Mengupdate komentar
export const updateCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { desc } = req.body;

    // Validasi input
    if (!desc) {
      return errorResponse(res, "Deskripsi harus diisi", "Bad Request", 400);
    }

    // Update komentar
    const comment = await updateComment(id, { desc });

    // Respons sukses
    return successResponse(res, comment, "Comment updated successfully");
  } catch (error: any) {
    // Respons error
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat mengupdate komentar",
      "Bad Request",
      400
    );
  }
};

// Menghapus komentar
export const deleteCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Hapus komentar
    await deleteComment(id);

    // Respons sukses
    return successResponse(res, null, "Comment deleted successfully", 204);
  } catch (error: any) {
    // Respons error
    return errorResponse(
      res,
      error.message || "Terjadi kesalahan saat menghapus komentar",
      "Bad Request",
      400
    );
  }
};
