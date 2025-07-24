import { Router } from "express";
import {
  deleteImage,
  getImageById,
  getImages,
  updateImage,
  uploadImage,
} from "../controllers/image.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();

/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Upload gambar ke Supabase
 *     tags:
 *       - Images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL gambar berhasil diupload
 */

router.post("/upload", upload.single("file"), uploadImage);
/**
 * @swagger
 * tags:
 *   - name: Image
 *     description: Manajemen gambar
 */

router.get("/", getImages);
router.get("/:id", getImageById);
router.patch("/:id", updateImage);
router.delete("/:id", deleteImage);

export default router;
