import { Request, Response } from "express";
import { PostType } from "@prisma/client";
import { bookmarkService } from "../services/bookmark.service";

export const getBookmarks = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = req.query.type as PostType | undefined;
  const categoryId = req.query.categoryId as string | undefined;

  const result = await bookmarkService.getUserBookmarks(
    userId,
    page,
    limit,
    search,
    type,
    categoryId
  );

  res.json(result);
};

export const addBookmark = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { postId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const exists = await bookmarkService.isBookmarked(userId, postId);
  if (exists) {
    return res.status(400).json({ message: "Post sudah dibookmark" });
  }

  const bookmark = await bookmarkService.addBookmark(userId, postId);
  res.status(201).json(bookmark);
};

export const removeBookmark = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { postId } = req.params;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const exists = await bookmarkService.isBookmarked(userId, postId);
  if (!exists) {
    return res.status(404).json({ message: "Bookmark tidak ditemukan" });
  }

  await bookmarkService.removeBookmark(userId, postId);
  res.json({ message: "Bookmark berhasil dihapus" });
};
