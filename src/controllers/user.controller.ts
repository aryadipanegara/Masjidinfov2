import { Request, Response } from "express";
import { userService } from "../services/user.service";

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "User tidak dikenali." });
  }

  try {
    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data user." });
  }
};
