import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  updatePost,
} from "../controllers/post.controller";
import { authenticateJwt } from "../middleware/auth.middleware";

const router = Router();

// Public
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);

// Protected
router.post("/", authenticateJwt, createPost);
router.put("/:id", authenticateJwt, updatePost);
router.delete("/:id", authenticateJwt, deletePost);

export default router;
