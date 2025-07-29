import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const decodeJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = payload as any;
    } catch {
      // kalau token invalid, abaikan saja
    }
  }

  next();
};
