import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient";
import { registerSchema, loginSchema } from "../utils/validation";
import { z } from "zod";

export const registerUser = async (
  userData: z.infer<typeof registerSchema>
) => {
  const { name, email, password } = userData;

  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email sudah digunakan");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Simpan user ke database
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Buat token JWT
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user: newUser, token };
};

export const loginUser = async (loginData: z.infer<typeof loginSchema>) => {
  const { email, password } = loginData;

  // Cek apakah email terdaftar
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Email atau password salah");
  }

  // Cek password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  // Buat token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};
