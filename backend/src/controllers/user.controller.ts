import { Request, Response } from "express";
import { userService } from "../services/user.service";
import {
  PaginatedUserResponse,
  UpdateUserPayload,
  UserDetail,
} from "../types/user.types";

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "User tidak dikenali." });
  }

  try {
    const user: UserDetail | null = await userService.getUserProfile(userId);

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

export const getUser = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  try {
    const result: PaginatedUserResponse = await userService.getUsers(
      page,
      limit,
      search
    );
    res.json(result);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user: UserDetail | null = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error getting user by ID:", err);
    res.status(500).json({ error: "Gagal mengambil user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: UpdateUserPayload = req.body;

  try {
    const updatedUser: UserDetail = await userService.updateUser(id, data);
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ error: "Gagal memperbarui user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await userService.deleteUser(id);
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Gagal menghapus user" });
  }
};
