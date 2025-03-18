import express from "express";
import {
  createCommentHandler,
  getCommentByIdHandler,
  getCommentsByPostIdHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Endpoint untuk komentar
router.post("/", authMiddleware, createCommentHandler); // Membuat komentar baru
router.get("/:id", getCommentByIdHandler); // Mendapatkan komentar berdasarkan ID
router.get("/post/:postId", getCommentsByPostIdHandler); // Mendapatkan semua komentar untuk sebuah post
router.put("/:id", authMiddleware, updateCommentHandler); // Mengupdate komentar
router.delete("/:id", authMiddleware, deleteCommentHandler); // Menghapus komentar

export default router;
