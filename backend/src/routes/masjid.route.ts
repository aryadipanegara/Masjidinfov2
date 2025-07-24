import { Router } from "express";
import {
  createMasjid,
  getMasjidByPostId,
  updateMasjid,
  deleteMasjid,
} from "../controllers/masjid.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Masjid
 *   description: Endpoint untuk data masjid yang terhubung ke post
 */

/**
 * @swagger
 * /masjids:
 *   post:
 *     summary: Buat data masjid baru (hanya untuk post bertipe MASJID)
 *     tags: [Masjid]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               namaLokal:
 *                 type: string
 *               alamat:
 *                 type: string
 *               kota:
 *                 type: string
 *               provinsi:
 *                 type: string
 *               negara:
 *                 type: string
 *               tahunDibangun:
 *                 type: string
 *               arsitek:
 *                 type: string
 *               gaya:
 *                 type: string
 *               mapsUrl:
 *                 type: string
 *               sumberFoto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Masjid berhasil dibuat
 */
router.post("/", createMasjid);

/**
 * @swagger
 * /masjids/{postId}:
 *   get:
 *     summary: Ambil data masjid berdasarkan postId
 *     tags: [Masjid]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail masjid ditemukan
 *       404:
 *         description: Masjid tidak ditemukan
 */
router.get("/:postId", getMasjidByPostId);

/**
 * @swagger
 * /masjids/{postId}:
 *   put:
 *     summary: Perbarui data masjid berdasarkan postId
 *     tags: [Masjid]
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
 *             $ref: '#/components/schemas/Masjid'
 *     responses:
 *       200:
 *         description: Masjid berhasil diperbarui
 */
router.put("/:postId", updateMasjid);

/**
 * @swagger
 * /masjids/{postId}:
 *   delete:
 *     summary: Hapus data masjid berdasarkan postId
 *     tags: [Masjid]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Masjid berhasil dihapus
 */
router.delete("/:postId", deleteMasjid);

export default router;
