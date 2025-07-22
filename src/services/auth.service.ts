import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.config";
import { generateToken } from "./jwt.service";
import { generateOTP, isOTPExpired } from "../utils/otp.utils";
import { sendOTP } from "./email.service";
import { UserPayload } from "../types/auth.types";
import { OTPPurpose } from "@prisma/client";
import { addMinutes } from "date-fns";
import { randomBytes } from "crypto";

export const authService = {
  registerUser: async (email: string, fullname: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        fullname,
        passwordHash: hashedPassword,
        isVerified: false,
      },
    });

    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        code: otp,
        purpose: "REGISTER" as OTPPurpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOTP(email, otp);
    return user;
  },

  verifyUserOTP: async (email: string, code: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User tidak ditemukan");

    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        code,
        purpose: "REGISTER",
        isUsed: false,
      },
    });

    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      throw new Error("OTP tidak valid atau sudah kadaluarsa");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
  },

  loginUser: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isVerified) {
      throw new Error("Email atau password salah atau belum verifikasi");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash!);
    if (!isValid) {
      throw new Error("Email atau password salah");
    }

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    return {
      token,
      requiresGoogle: !user.hasGoogleAccount,
    };
  },

  forgotPassword: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Jangan bocorkan jika email tidak terdaftar

    const otp = generateOTP();
    await prisma.oTPVerification.create({
      data: {
        userId: user.id,
        code: otp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOTP(email, otp);
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User tidak ditemukan");

    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        userId: user.id,
        code,
        purpose: "FORGOT_PASSWORD",
        isUsed: false,
      },
    });

    if (!otpRecord || isOTPExpired(otpRecord.expiresAt)) {
      throw new Error("OTP tidak valid atau sudah kadaluarsa");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashed },
    });

    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
  },
  createSession: async (userId: string) => {
    const token = randomBytes(40).toString("hex");
    const expires = addMinutes(new Date(), 60 * 24 * 7); // 7 hari
    const session = await prisma.session.create({
      data: {
        userId,
        sessionToken: token,
        expires,
      },
    });
    return session;
  },

  validateSession: async (sessionToken: string) => {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) return null;
    return session.user;
  },

  revokeSession: async (sessionToken: string) => {
    await prisma.session.delete({ where: { sessionToken } });
  },
};
