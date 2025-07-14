// controllers/postController.ts
import { Request, Response, NextFunction } from "express";
import { CreatePostDto, PostService } from "../services/post.service";

/**
 * Bentuk payload yang kita set di req.user setelah authenticateJwt
 */
interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Ambil dan validasi payload JWT dari req.user
 */
function getJwtPayload(req: Request): JwtPayload | null {
  // Passport/Express gw set req.user sebagai Express.User, jadi kita cast ke bentuk JwtPayload
  const user = (req.user ?? {}) as unknown as JwtPayload;
  if (typeof user.userId === "string" && typeof user.role === "string") {
    return user;
  }
  return null;
}

/**
 * Guard sederhana berdasar role
 */
function requireRole(payload: JwtPayload, roles: string[]) {
  if (!roles.includes(payload.role)) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
}

/**
 * [POST] /api/posts
 * Hanya admin/editor yang boleh membuat
 */
export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = getJwtPayload(req);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    requireRole(payload, ["admin", "editor"]);

    const dto = req.body as CreatePostDto;
    const post = await PostService.createPost(dto, payload.userId);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * [GET] /api/posts
 * Publik, ambil semua post (non-deleted)
 */
export async function getAllPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const posts = await PostService.getAllPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

/**
 * [GET] /api/posts/:slug
 * Publik, detail per slug
 */
export async function getPostBySlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const post = await PostService.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * [PUT] /api/posts/:id
 * Hanya admin/editor yang boleh update
 */
export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = getJwtPayload(req);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    requireRole(payload, ["admin", "editor"]);

    const dto = req.body as Partial<CreatePostDto>;
    const updated = await PostService.updatePost(req.params.id, dto);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * [DELETE] /api/posts/:id
 * Hanya admin yang boleh soft-delete
 */
export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = getJwtPayload(req);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    requireRole(payload, ["admin"]);

    await PostService.deletePost(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
