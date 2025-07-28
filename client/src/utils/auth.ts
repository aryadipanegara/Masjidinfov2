import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Interface untuk payload JWT
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Interface untuk user data
interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Menyimpan token ke cookies
 */
export function setAuthToken(token: string): void {
  Cookies.set("token", token, {
    expires: 1,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
}

/**
 * Menghapus token dari cookies
 */
export function removeAuthToken(): void {
  Cookies.remove("token");
}

/**
 * Mengambil token dari cookies
 */
export function getAuthToken(): string | undefined {
  return Cookies.get("token");
}

/**
 * Mendecode token JWT
 */
export function getDecodedToken(): JWTPayload | null {
  const token = getAuthToken();
  if (!token) return null;

  try {
    return jwtDecode<JWTPayload>(token);
  } catch (e) {
    console.error("Decode JWT gagal", e);
    return null;
  }
}

/**
 * Mendapatkan data user dari token
 */
export function getCurrentUser(): User | null {
  const decoded = getDecodedToken();
  if (!decoded) return null;

  return {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };
}

/**
 * Mengecek apakah user sudah terautentikasi
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Mendapatkan role user
 */
export function getUserRole(): string | null {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}

/**
 * Mengecek apakah user memiliki role tertentu
 */
export function hasRole(requiredRole: string): boolean {
  const role = getUserRole();
  return role === requiredRole;
}

/**
 * Mengecek apakah user memiliki salah satu role dari daftar role
 */
export function hasAnyRole(roles: string[]): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;
  return roles.includes(userRole);
}

/**
 * Mengecek apakah token sudah expired
 */
export function isTokenExpired(): boolean {
  const decoded = getDecodedToken();
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp <= currentTime;
}

/**
 * Refresh token (jika diperlukan)
 * Kamu bisa mengimplementasi logika refresh token di sini
 */
export async function refreshToken(): Promise<boolean> {
  return false;
}
