import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Mengambil profil pengguna
export const getUserProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }, // Jangan kembalikan password
  });
};

// Memperbarui profil pengguna
export const updateUserProfile = async (
  userId: string,
  data: { name?: string; email?: string }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true }, // Jangan kembalikan password
  });
};

// Mengubah password pengguna
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Verifikasi password lama
  if (user.password !== oldPassword) {
    // Ganti dengan bcrypt.compare jika menggunakan hashing
    throw new Error("Old password is incorrect");
  }

  // Update password baru
  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword }, // Ganti dengan bcrypt.hash jika menggunakan hashing
  });
};
