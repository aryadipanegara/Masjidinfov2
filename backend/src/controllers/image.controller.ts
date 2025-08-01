import { Request, Response } from "express";
import { imageService } from "../services/image.service";
import multer from "multer";
import { Prisma } from "@prisma/client";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const { altText, caption, postId } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: userId tidak ditemukan." });
    }

    if (!file) {
      return res.status(400).json({
        error:
          "Gambar tidak ditemukan dalam request atau format file tidak didukung.",
      });
    }

    const image = await imageService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      altText,
      caption,
      postId,
      userId
    );

    res.status(201).json({
      message: "Gambar berhasil diupload",
      data: image,
    });
  } catch (error: any) {
    console.error("Upload Image Controller Error:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "Ukuran file terlalu besar. Maksimal 5MB." });
      }

      return res.status(400).json({ error: error.message });
    }

    if (error.message && error.message.includes("Tipe file tidak didukung")) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Konflik data saat menyimpan gambar." });
      }
    }

    res.status(500).json({ error: error.message || "Gagal mengupload gambar" });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;

    const images = await imageService.getImages(postId as string | undefined);

    res.status(200).json({
      message: "Berhasil mengambil daftar gambar",
      data: images,
      count: images.length,
    });
  } catch (error: any) {
    console.error("Get Images Controller Error:", error);
    res
      .status(500)
      .json({ error: error.message || "Gagal mengambil daftar gambar" });
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
  try {
    const { id } = req.params;

    await imageService.deleteImageById(id);

    res.status(200).json({
      message: "Gambar berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete Image Controller Error:", error);
    if (error.message && error.message.includes("not found")) {
      return res
        .status(404)
        .json({ error: "Gambar tidak ditemukan untuk dihapus." });
    }
    res.status(500).json({ error: error.message || "Gagal menghapus gambar" });
  }
};
