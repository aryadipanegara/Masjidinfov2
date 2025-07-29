import { Request, Response } from "express";
import { PostType } from "@prisma/client";
import { historyService } from "../services/history.service";

export const getHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = req.query.type as PostType | undefined;
  const categoryId = req.query.categoryId as string | undefined;

  const result = await historyService.getUserHistories(
    userId,
    page,
    limit,
    search,
    type,
    categoryId
  );

  res.json(result);
};
