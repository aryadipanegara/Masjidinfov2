import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role; // Ambil role dari token

  if (userRole !== "ADMIN") {
    res
      .status(403)
      .json({ error: "Akses ditolak. Hanya admin yang diizinkan" }); // Tidak perlu return
    return; // Hentikan eksekusi
  }

  next(); // Lanjutkan jika role adalah ADMIN
};
