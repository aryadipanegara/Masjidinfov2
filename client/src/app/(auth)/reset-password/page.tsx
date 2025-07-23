"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { AuthService } from "@/service/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null); // State untuk token dari URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      // Jika tidak ada token di URL, arahkan kembali ke halaman forgot-password
      notify.error("Tautan reset password tidak valid atau hilang.");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const validatePassword = (pwd: string, confPwd: string) => {
    const validation = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      match: pwd === confPwd,
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      notify.error("Token reset password tidak ditemukan.");
      return;
    }

    if (!validatePassword(newPassword, confirmNewPassword)) {
      notify.error("Validasi password gagal. Periksa kembali persyaratan.");
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Mereset password...");

    try {
      const res = await AuthService.resetPassword({ token, newPassword });
      const data = res.data;

      notify.dismiss(loadingToastId);
      notify.success(
        data.message || "Password berhasil direset. Silakan login kembali."
      );
      router.push("/login");
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordFormValid =
    newPassword &&
    confirmNewPassword &&
    Object.values(passwordValidation).every(Boolean) &&
    !loading;

  // Tampilkan loading atau pesan jika token belum ada
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Memuat...</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Mengecek tautan reset password Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Jika Anda tidak dialihkan, silakan kembali ke halaman lupa
              password.
            </p>
            <Link
              href="/forgot-password"
              className="underline text-primary hover:text-primary/80 mt-4 inline-block"
            >
              Lupa Password
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            Atur Password Baru
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Masukkan password baru Anda untuk akun ini
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleResetPassword} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value, confirmNewPassword);
                  }}
                  required
                  className="pr-10 h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1 grid gap-1">
                <p
                  className={
                    passwordValidation.length
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Minimal 8 karakter
                </p>
                <p
                  className={
                    passwordValidation.uppercase
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Setidaknya 1 huruf besar (A-Z)
                </p>
                <p
                  className={
                    passwordValidation.lowercase
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Setidaknya 1 huruf kecil (a-z)
                </p>
                <p
                  className={
                    passwordValidation.number
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Setidaknya 1 angka (0-9)
                </p>
                <p
                  className={
                    passwordValidation.specialChar
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Setidaknya 1 karakter spesial (!@#$...)
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-new-password">
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    validatePassword(newPassword, e.target.value);
                  }}
                  required
                  className="pr-10 h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                >
                  {showConfirmNewPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmNewPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {confirmNewPassword && !passwordValidation.match && (
                <p className="text-red-500 text-sm mt-1">
                  Password tidak cocok.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-10"
              disabled={!isPasswordFormValid}
            >
              {loading ? "Mereset..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardContent className="mt-4 text-center text-sm text-muted-foreground">
          Kembali ke{" "}
          <Link
            href="/login"
            className="underline text-primary hover:text-primary/80"
          >
            Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
