import { Request, Response } from "express";
import { imageService } from "../services/image.service";
import multer from "multer";
import { Prisma } from "@prisma/client";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak didukung. Hanya JPEG, PNG, GIF, WEBP yang diperbolehkan."
      ) as any,
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const { altText, caption, postId } = req.body;
    const userId = (req as any).user?.userId;

    // 🔐 1. Validasi: User harus login
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized: Autentikasi diperlukan untuk upload gambar.",
      });
    }

    // 📦 2. Validasi: File harus ada
    if (!file) {
      return res.status(400).json({
        error: "Gambar tidak ditemukan dalam request.",
      });
    }

    // 🧹 3. Normalisasi input (opsional, tapi aman)
    const sanitizedAltText = altText ? String(altText).trim() : undefined;
    const sanitizedCaption = caption ? String(caption).trim() : undefined;
    const sanitizedPostId = postId ? String(postId).trim() : undefined;

    // 🚀 4. Upload via service (akan validasi userId lagi + simpan)
    const image = await imageService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      sanitizedAltText,
      sanitizedCaption,
      sanitizedPostId,
      userId
    );

    // ✅ 5. Response sukses
    return res.status(201).json({
      message: "Gambar berhasil diupload",
      data: image,
    });
  } catch (error: any) {
    console.error("Upload Image Controller Error:", error);

    // 🛑 Multer error (file size, format, etc)
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Ukuran file terlalu besar. Maksimal 5MB.",
        });
      }
      return res.status(400).json({ error: error.message });
    }

    // ❌ File type tidak didukung
    if (error.message?.includes("Tipe file tidak didukung")) {
      return res.status(400).json({ error: error.message });
    }

    // ⚠️ Unauthorized dari service
    if (error.message?.includes("Unauthorized")) {
      return res.status(401).json({ error: error.message });
    }

    // 🔒 User tidak ditemukan di database
    if (error.message?.includes("User tidak ditemukan di database")) {
      return res.status(401).json({ error: error.message });
    }

    // 🛢️ Prisma error (duplikat, dll)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          error: "Gagal menyimpan: data gambar sudah ada.",
        });
      }
    }

    // 🐛 Error lain (internal)
    return res.status(500).json({
      error: "Gagal mengupload gambar. Silakan coba lagi.",
      // Hanya kirim detail error di dev
      ...(process.env.NODE_ENV === "development" && { debug: error.message }),
    });
  }
};

type SortParam = "newest" | "oldest" | "order-asc" | "order-desc";
const ALLOWED_SORT: SortParam[] = [
  "newest",
  "oldest",
  "order-asc",
  "order-desc",
];

const toBool = (v: unknown) => v === "true" || v === true;

export const getImages = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      search,
      postId,
      uploadedById,
      dateFrom,
      dateTo,
      sort,
      includeDeleted,
    } = req.query;

    const sortSafe = ALLOWED_SORT.includes((sort as SortParam) || "order-asc")
      ? (sort as SortParam)
      : "order-asc";

    const result = await imageService.getImages({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: (search as string) || undefined,
      postId: (postId as string) || undefined,
      uploadedById: (uploadedById as string) || undefined,
      dateFrom: (dateFrom as string) || undefined,
      dateTo: (dateTo as string) || undefined,
      sort: sortSafe,
      includeDeleted: toBool(includeDeleted),
    });

    // Konsisten dengan posts: { data: [...], pagination: {...} }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Images Controller Error:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Gagal mengambil daftar gambar" });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await imageService.getImageById(id);

    if (!image) {
      return res.status(404).json({ error: "Gambar tidak ditemukan" });
    }

    res.status(200).json({
      message: "Berhasil mengambil detail gambar",
      data: image,
    });
  } catch (error: any) {
    console.error("Get Image By ID Controller Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2023") {
        return res.status(400).json({ error: "ID gambar tidak valid." });
      }
    }
    res
      .status(500)
      .json({ error: error.message || "Gagal mengambil detail gambar" });
  }
};
export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!updateData || Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "Tidak ada data yang diberikan untuk diupdate." });
    }

    const updatedImage = await imageService.updateImage(id, updateData);

    if (!updatedImage) {
      return res
        .status(404)
        .json({ error: "Gambar tidak ditemukan untuk diupdate" });
    }

    res.status(200).json({
      message: "Berhasil memperbarui gambar",
      data: updatedImage,
    });
  } catch (error: any) {
    console.error("Update Image Controller Error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "Gambar tidak ditemukan untuk diupdate." });
      }
    }
    res
      .status(500)
      .json({ error: error.message || "Gagal memperbarui gambar" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await imageService.deleteImageById(id);
    res.status(200).json({
      message: "Gambar dijadwalkan untuk dihapus (soft-delete).",
    });
  } catch (error: any) {
    console.error("Delete Image Controller Error:", error);
    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ error: "Gambar tidak ditemukan untuk dihapus." });
    }
    res
      .status(500)
      .json({ error: error.message || "Gagal melakukan soft-delete gambar." });
  }
};

export const restoreImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await imageService.restoreImageById(id);
    res.status(200).json({ message: "Gambar berhasil dipulihkan." });
  } catch (error: any) {
    console.error("Restore Image Controller Error:", error);
    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ error: "Gambar tidak ditemukan untuk dipulihkan." });
    }
    res
      .status(500)
      .json({ error: error.message || "Gagal memulihkan gambar." });
  }
};
