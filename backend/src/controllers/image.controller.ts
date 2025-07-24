import { Request, Response } from "express";
import { imageService } from "../services/image.service";

export const uploadImage = async (req: Request, res: Response) => {
  const file = (req as any).file;
  const { altText, caption, postId } = req.body;

  if (!file) {
    return res
      .status(400)
      .json({ error: "Gambar tidak ditemukan dalam request" });
  }

  try {
    const image = await imageService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      altText,
      caption,
      postId
    );

    res.status(201).json(image); // Berisi data lengkap dari DB
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Gagal mengupload gambar" });
  }
};

export const getImages = async (req: Request, res: Response) => {
  const postId = req.query.postId as string | undefined;
  const images = await imageService.getImages(postId);
  res.json(images);
};

export const getImageById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = await imageService.getImageById(id);
  if (!image) return res.status(404).json({ error: "Gambar tidak ditemukan" });
  res.json(image);
};

export const updateImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { caption, altText, order } = req.body;
  const updated = await imageService.updateImage(id, {
    caption,
    altText,
    order,
  });
  res.json(updated);
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  await imageService.deleteImage(id);
  res.status(204).end();
};
