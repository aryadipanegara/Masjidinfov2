import { Router } from "express";
import passport from "../config/passport.config";
import {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register akun baru
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullname
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               fullname:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: OTP dikirim ke email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Email sudah terdaftar
 *       500:
 *         description: Terjadi kesalahan saat registrasi
 */
router.post("/register", register);
/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verifikasi OTP untuk aktivasi akun
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verifikasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: OTP tidak valid atau kadaluarsa
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Gagal memperbarui data
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login dengan email dan password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   token:
 *                     type: string
 *               - type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   requiresGoogle:
 *                     type: boolean
 *                   token:
 *                     type: string
 *       400:
 *         description: Field tidak lengkap
 *       401:
 *         description: Email atau password salah atau belum verifikasi
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login dengan akun Google
 *     tags:
 *       - Auth
 *     description:
 *       Redirect ke halaman login Google. Jika login berhasil, akan diarahkan ke `/api/auth/google`.
 *     responses:
 *       302:
 *         description: Redirect ke Google login
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/connect",
  authenticate,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback Google OAuth
 *     tags:
 *       - Auth
 *     description:
 *       Endpoint ini dipanggil oleh Google setelah user login. Jika berhasil, server akan mengembalikan JWT token dalam bentuk JSON.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Kode otorisasi dari Google
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         required: false
 *         description: Scope akses yang diminta
 *     responses:
 *       200:
 *         description: Login Google berhasil dan JWT dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Login gagal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Login gagal
 */

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => {
    const token = (req.user as any)?.token;
    if (!token) {
      return res.status(401).json({ error: "Login gagal" });
    }
    res.status(200).json({ token });
  }
);
router.get("/failure", (req, res) => {
  const message = req.query.message || "Login gagal";
  res.status(401).json({ error: message });
});

// Jika sudah ada frontend gunakan ini
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//     failureRedirect: "/api/auth/failure",
//   }),
//   (req, res) => {
//     const { token, connected } = req.user as any;

//     // CONNECT mode: redirect ke dashboard/settings
//     if (connected) {
//       return res.redirect(`${process.env.CLIENT_URL}/settings?connected=true`);
//     }

//     // LOGIN mode: kirim token langsung (atau redirect ke /auth/callback?token=...)
//     res.json({ token });
//   }
// );

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Mengirimkan OTP ke email untuk reset password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim (jika email valid)
 *       400:
 *         description: Email tidak valid
 *       500:
 *         description: Terjadi kesalahan saat mengirim OTP
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password menggunakan OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@email.com
 *               code:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: newsecurepassword123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       400:
 *         description: OTP tidak valid atau data tidak lengkap
 *       500:
 *         description: Kesalahan server
 */
router.post("/reset-password", resetPassword);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

export default router;
