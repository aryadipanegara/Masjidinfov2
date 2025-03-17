import { Request, Response, NextFunction } from "express"; // Pastikan ini diimpor
import express from "express";
import {
  createPostHandler,
  getPostBySlugHandler,
  updatePostHandler,
  deletePostHandler,
  getAllPostsHandler,
} from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/authorizationMiddleware";

const router = express.Router();

// Hanya admin yang bisa membuat/mengelola post
router.post("/", authMiddleware, isAdmin, createPostHandler);
router.put("/:id", authMiddleware, isAdmin, updatePostHandler);
router.delete("/:id", authMiddleware, isAdmin, deletePostHandler);

// Public routes
router.get("/", getAllPostsHandler);
router.get("/:slug", getPostBySlugHandler);

export default router;
