import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseUtil";

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userRole = (req as any).user?.role; // Ambil role dari token

  if (userRole !== "ADMIN") {
    return errorResponse(
      res,
      "Akses ditolak. Hanya admin yang diizinkan",
      "Forbidden",
      403
    );
  }

  next(); // Lanjutkan jika role adalah ADMIN
};
