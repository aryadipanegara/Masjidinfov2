import { Request, Response } from "express";
import { masjidService } from "../services/masjid.service";

export const createMasjid = async (req: Request, res: Response) => {
  try {
    const { postId, ...payload } = req.body;
    const masjid = await masjidService.createMasjid(postId, payload);
    res.status(201).json(masjid);
  } catch (error: any) {
    console.error("Error creating masjid:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getMasjidByPostId = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const masjid = await masjidService.getMasjidByPostId(postId);

    if (!masjid) {
      return res.status(404).json({ error: "Masjid not found" });
    }

    res.json(masjid);
  } catch (error: any) {
    console.error("Error fetching masjid:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const updateMasjid = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const data = req.body;
    const masjid = await masjidService.updateMasjid(postId, data);
    res.json(masjid);
  } catch (error: any) {
    console.error("Error updating masjid:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteMasjid = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    await masjidService.deleteMasjid(postId);
    res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting masjid:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
