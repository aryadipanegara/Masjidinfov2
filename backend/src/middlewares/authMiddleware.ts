import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { errorResponse } from "../utils/responseUtil";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return errorResponse(
      res,
      "Akses ditolak. Token tidak ditemukan",
      "Unauthorized",
      401
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Token tidak valid", "Forbidden", 403);
  }
};
