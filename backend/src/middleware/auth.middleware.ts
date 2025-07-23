import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt.service";

// middleware/auth.middleware.ts

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Akses ditolak. Token tidak ada." });
  }

  const token = authHeader.split(" ")[1]; // ambil setelah "Bearer"

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa." });
  }
};
