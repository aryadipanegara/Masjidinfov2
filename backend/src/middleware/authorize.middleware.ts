import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk membatasi akses berdasarkan peran user.
 * Digunakan setelah middleware `authenticate`.
 *
 * @param allowedRoles - daftar role yang diperbolehkan mengakses route
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      res.status(401).json({ error: "User tidak dikenali" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: "Akses ditolak. Role tidak diizinkan." });
      return;
    }

    next();
  };
};
