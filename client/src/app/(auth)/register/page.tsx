"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { ChromeIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { AuthService } from "@/service/auth.service";

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });
  const router = useRouter();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password, confirmPassword)) {
      notify.error("Validasi password gagal. Periksa kembali persyaratan.");
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Sedang mendaftar...");

    try {
      const res = await AuthService.register({ email, fullname, password });
      const data = res.data;

      localStorage.setItem("registeredEmail", email);

      notify.dismiss(loadingToastId);
      notify.success(data.message || "Registrasi berhasil!");

      router.push(`/verify-otp`);
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    notify.loading("Mengarahkan ke Google...");
    window.location.href = AuthService.getGoogleLoginUrl();
  };

  const isFormValid =
    fullname &&
    email &&
    password &&
    confirmPassword &&
    Object.values(passwordValidation).every(Boolean) &&
    !loading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Buat Akun Baru</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Daftar untuk memulai perjalanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Nama Lengkap</Label>
              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value, confirmPassword);
                  }}
                  required
                  className="pr-10 h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
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
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePassword(password, e.target.value);
                  }}
                  required
                  className="pr-10 h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {confirmPassword && !passwordValidation.match && (
                <p className="text-red-500 text-sm mt-1">
                  Password tidak cocok.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-10"
              disabled={!isFormValid}
            >
              {loading ? "Memuat..." : "Daftar"}
            </Button>
          </form>
          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-10 bg-transparent"
            onClick={handleGoogleRegister}
          >
            <ChromeIcon className="mr-2 h-4 w-4" />
            Daftar dengan Google
          </Button>
        </CardContent>
        <CardContent className="mt-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
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
