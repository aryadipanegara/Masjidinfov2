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
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as "recent" | "popular") || "recent";

    const userId = (req as any).user?.userId;

    const result = await commentService.getCommentsByPost(
      postId,
      userId,
      page,
      limit,
      sort
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch comments" });
  }
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

export const getAllComments = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as "recent" | "popular") || "recent";

  try {
    const result = await commentService.getAllComments(page, limit, sort);
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching all comments:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch all comments" });
  }
};

// Like a comment
export const likeComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { commentId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await commentService.likeComment(commentId, userId);
    const totalLikes = await commentService.getCommentLikeCount(commentId);

    res.json({
      success: true,
      liked: true,
      totalLikes,
    });
  } catch (error: any) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: error.message || "Failed to like comment" });
  }
};

// Unlike a comment
export const unlikeComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { commentId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await commentService.unlikeComment(commentId, userId);
    const totalLikes = await commentService.getCommentLikeCount(commentId);

    res.json({
      success: true,
      liked: false,
      totalLikes,
    });
  } catch (error: any) {
    console.error("Error unliking comment:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to unlike comment" });
  }
};
