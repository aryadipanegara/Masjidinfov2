import { Request, Response } from "express";
import { announcementService } from "../services/announcement.service";

// Ambil 1 pengumuman aktif (untuk publik/user biasa)
export const getActiveAnnouncement = async (_req: Request, res: Response) => {
  const result = await announcementService.getActiveAnnouncement();
  res.json(result);
};

// Ambil semua pengumuman (dengan pagination, untuk admin panel)
export const getAllAnnouncements = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await announcementService.getAnnouncements(page, limit);
  res.json(result);
};

// Buat pengumuman baru
export const createAnnouncement = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Pesan wajib diisi" });

  const result = await announcementService.createAnnouncement(message);
  res.status(201).json(result);
};

// Update isi pengumuman
export const updateAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Pesan wajib diisi" });

  const result = await announcementService.updateAnnouncement(id, message);
  res.json(result);
};

// Aktif/nonaktif pengumuman
export const toggleAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const result = await announcementService.toggleAnnouncement(id, isActive);
  res.json(result);
};

// Hapus pengumuman
export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  await announcementService.deleteAnnouncement(id);
  res.status(204).end();
};
