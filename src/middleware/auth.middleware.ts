import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  try {
    const payload = jwt.verify(auth.split(" ")[1], JWT_SECRET) as any;
    // sekarang TS tahu Request punya .user, jadi ini aman
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
