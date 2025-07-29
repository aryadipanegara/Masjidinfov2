import { Request, Response } from "express";
import { readlistService } from "../services/readlist.service";
import { PostType } from "@prisma/client";

export const createReadList = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { name } = req.body;
  if (!userId || !name) return res.status(400).json({ error: "Invalid data" });

  const result = await readlistService.createReadList(userId, name);
  res.status(201).json(result);
};

export const getMyReadLists = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const result = await readlistService.getUserReadLists(userId);
  res.json(result);
};

export const addPost = async (req: Request, res: Response) => {
  const { readListId, postId } = req.params;
  const result = await readlistService.addPostToReadList(readListId, postId);
  res.status(201).json(result);
};

export const removePost = async (req: Request, res: Response) => {
  const { readListId, postId } = req.params;
  await readlistService.removePostFromReadList(readListId, postId);
  res.json({ message: "Post removed from readlist" });
};

export const getReadListPosts = async (req: Request, res: Response) => {
  const { readListId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";
  const type = req.query.type as PostType | undefined;
  const categoryId = req.query.categoryId as string | undefined;

  const result = await readlistService.getReadListPosts(
    readListId,
    page,
    limit,
    search,
    type,
    categoryId
  );

  res.json(result);
};
