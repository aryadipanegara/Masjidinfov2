import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createPost,
  deletePost,
  getPopularPosts,
  getPostById,
  getPostBySlug,
  getPosts,
  getRecommendedPosts,
  updatePost,
  updatePostBySlug,
} from "../controllers/posts.controller";

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get list of posts with pagination and filtering
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ARTICLE, MASJID]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/", getPosts);
router.get("/popular", getPopularPosts);
router.get("/recommended", getRecommendedPosts);

router.get("/slug/:slug", getPostBySlug);

router.put("/slug/:slug", updatePostBySlug);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get detail of a single post
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get("/:id", getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Post
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug, content, type]
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ARTICLE, MASJID]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created
 */
router.post("/", authenticate, createPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags:
 *       - Post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */
router.put("/:id", authenticate, updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Soft delete a post
 *     tags:
 *       - Post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authenticate, deletePost);

export default router;
