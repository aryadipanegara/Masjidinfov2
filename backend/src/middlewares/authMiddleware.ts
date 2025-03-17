import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Akses ditolak. Token tidak ditemukan" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string; // userId
      email: string;
      role: string;
    };
    (req as any).user = decoded; // Simpan user (termasuk userId) di req
    next();
  } catch (error) {
    res.status(403).json({ error: "Token tidak valid" });
  }
};
