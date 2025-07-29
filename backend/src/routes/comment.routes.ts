import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment,
} from "../controllers/comment.contoller";

const router = Router();

router.get("/:postId/comments", getCommentsByPost);

/**
 * @swagger
 * /{postId}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags:
 *       - Comment
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *   post:
 *     summary: Create a new comment or reply to an existing comment
 *     tags:
 *       - Comment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */

/**
 * @swagger
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *               example: Test Reply fitur comment
 *             parentId:
 *               type: string
 *               example: 01K1AWFTQWTW0QV63H5ZXQX509
 *         required:
 *           - content
 *           - parentId
 */
router.post("/:postId/comments", authenticate, createComment);

router.patch("/:commentId", authenticate, updateComment);
router.delete("/:commentId", authenticate, deleteComment);

export default router;
