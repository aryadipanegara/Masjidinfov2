import express from "express";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware"; // Middleware untuk autentikasi

const router = express.Router();

// Endpoint untuk user
router.get("/profile", authMiddleware, getProfileHandler); // Mengambil profil pengguna
router.put("/profile", authMiddleware, updateProfileHandler); // Memperbarui profil pengguna
router.put("/change-password", authMiddleware, changePasswordHandler); // Mengubah password pengguna

export default router;
