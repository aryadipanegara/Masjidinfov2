import { Request, Response } from "express";
import { commentService } from "../services/comment.service";

export const createComment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { postId } = req.params;
  const { content, parentId } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Isi komentar wajib diisi" });
  }

  const comment = await commentService.createComment(
    content,
    userId,
    postId,
    parentId
  );

  res.status(201).json(comment);
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await commentService.getCommentsByPost(postId, page, limit);
  res.json(result);
};

export const updateComment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { commentId } = req.params;
  const { content } = req.body;

  if (!userId || !content)
    return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    const updated = await commentService.updateComment(
      commentId,
      userId,
      content
    );
    res.json(updated);
  } catch (err: any) {
    res.status(403).json({ error: err.message || "Tidak diizinkan" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { commentId } = req.params;

  try {
    await commentService.deleteComment(commentId, userId);
    res.status(204).end();
  } catch (err: any) {
    res.status(403).json({ error: err.message || "Tidak diizinkan" });
  }
};
