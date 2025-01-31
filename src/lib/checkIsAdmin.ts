"use server";

import { auth } from "./auth";

// Fungsi untuk mengecek apakah pengguna sudah login
export const checkIsAuthenticated = async () => {
  const session = await auth();
  return session ? true : false;
};

// Fungsi untuk mengecek apakah pengguna adalah admin
export const checkIsAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "ADMIN";
};
