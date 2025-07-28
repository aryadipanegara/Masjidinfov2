import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.use(authenticate);
// router.use(authorize("ADMIN", "SUPER_ADMIN"));

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Manajemen Kategori Artikel
 */
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Tambah kategori baru
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 */
router.post("/", authenticate, createCategory);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Ambil daftar kategori
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar kategori
 */
router.get("/", authenticate, getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Ambil detail kategori berdasarkan ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail kategori
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get("/:id", authenticate, getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Ubah nama kategori
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diubah
 */
router.put("/:id", authenticate, updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Hapus kategori
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */
router.delete("/:id", authenticate, deleteCategory);

export default router;
