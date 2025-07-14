import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";

export function googleCallback(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Auth failed" });
  const payload = { userId: req.user.id, role: req.user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token, user: req.user });
}
