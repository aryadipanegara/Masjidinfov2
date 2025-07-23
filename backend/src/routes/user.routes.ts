import { Router } from "express";
import {
  deleteUser,
  getMe,
  getUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN", "SUPER_ADMIN"));

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

router.get("/", getUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
