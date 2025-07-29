import { Router } from "express";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../controllers/bookmark.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get list of bookmarks
 *     tags:
 *       - Bookmark
 *     responses:
 *       200:
 *         description: List of bookmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
 */
router.get("/", authenticate, getBookmarks);

/**
 * @swagger
 * /bookmarks/{postId}:
 *   post:
 *     summary: Add bookmark
 *     tags:
 *       - Bookmark
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       201:
 *         description: Bookmark added
 */
router.post("/:postId", authenticate, addBookmark);

/**
 * @swagger
 * /bookmarks/{postId}:
 *   delete:
 *     summary: Remove bookmark
 *     tags:
 *       - Bookmark
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Bookmark removed
 */
router.delete("/:postId", authenticate, removeBookmark);

export default router;
