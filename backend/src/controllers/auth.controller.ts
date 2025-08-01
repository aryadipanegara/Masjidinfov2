import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { generateToken } from "../services/jwt.service";

export const register = async (req: Request, res: Response) => {
  const { email, fullname, password } = req.body;

  try {
    if (!email || !fullname || !password) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    await authService.registerUser(email, fullname, password);
    res.json({ message: "Silakan cek email untuk verifikasi OTP" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    await authService.verifyUserOTP(email, code);
    res.json({ message: "Verifikasi berhasil! Anda bisa login." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    const { token, requiresGoogle } = await authService.loginUser(
      email,
      password
    );

    if (requiresGoogle) {
      return res.json({
        message: "Login berhasil, tapi Anda belum connect ke Google",
        requiresGoogle: true,
        token,
      });
    }

    return res.json({
      message: "Login berhasil",
      requiresGoogle: false,
      token,
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email wajib diisi." });
  }

  try {
    await authService.forgotPassword(email);
    res.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    });
  } catch (err: any) {
    console.error("Forgot Password Error:", err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses permintaan." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token dan password baru wajib diisi." });
  }

  try {
    await authService.resetPassword(token, newPassword);
    res.json({
      message: "Password berhasil diperbarui. Silakan login kembali.",
    });
  } catch (err: any) {
    console.error("Reset Password Error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "pas" });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }

  try {
    const result = await authService.setPassword(userId, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionToken = req.cookies?.refresh_token;

  if (!sessionToken) {
    res.status(401).json({ error: "Refresh token tidak ditemukan." });
    return;
  }

  const user = await authService.validateSession(sessionToken);
  if (!user) {
    res.status(401).json({ error: "Refresh token tidak valid." });
    return;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateToken(payload);
  res.json({ accessToken: newAccessToken });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const sessionToken = req.cookies["token"];
  if (!sessionToken) {
    res.status(400).json({ error: "Tidak ada sesi yang ditemukan." });
    return;
  }

  try {
    await authService.revokeSession(sessionToken);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat logout" });
  }
};
