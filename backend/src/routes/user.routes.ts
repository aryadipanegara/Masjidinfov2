import { Router } from "express";
import { getMe } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Dapatkan data user yang sedang login
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Data user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 fullname:
 *                   type: string
 *                 role:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                   nullable: true
 *                 isVerified:
 *                   type: boolean
 *                 hasGoogleAccount:
 *                   type: boolean
 *       401:
 *         description: Token tidak valid atau tidak ada
 */
router.get("/me", authenticate, getMe);

export default router;
