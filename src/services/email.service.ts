import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

// Buat transporter dengan konfigurasi SMTP manual
const transporter = nodemailer.createTransport({
  host: ENV.EMAIL_HOST,
  port: parseInt(ENV.EMAIL_PORT),
  secure: false, // `true` untuk 465, `false` untuk 587
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Hanya untuk development, di production sebaiknya true
  },
});

export const sendOTP = async (to: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: ENV.EMAIL_FROM, // "OTP MASJID INFO <jeaniegunawan@gmail.com>"
    to,
    subject: "Kode Verifikasi Anda",
    text: `Kode verifikasi Anda: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #1a73e8;">Kode Verifikasi</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar. Berikut kode verifikasi Anda:</p>
        <div style="font-size: 24px; font-weight: bold; color: #1a73e8; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
        <hr>
        <small style="color: #777;">© 2025 Masjid Info. Semua hak dilindungi.</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email OTP berhasil dikirim ke ${to}`);
  } catch (error) {
    console.error("Gagal kirim email:", error);
    throw new Error("Gagal mengirim email verifikasi");
  }
};
