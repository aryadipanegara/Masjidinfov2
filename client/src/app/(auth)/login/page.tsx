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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      setPasswordError("Password minimal 8 karakter.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Sedang login...");

    try {
      const res = await AuthService.login({ email, password });
      const data = res.data; // Data dari respons Axios

      notify.dismiss(loadingToastId);
      notify.success("Login berhasil!");

      if (data.requiresGoogle) {
        notify.error(
          data.message || "Login berhasil, tapi Anda belum connect ke Google"
        );
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    notify.loading("Mengarahkan ke Google...");
    window.location.href = AuthService.getGoogleLoginUrl(); // Gunakan AuthService
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            Selamat Datang Kembali!
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleLogin} className="grid gap-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm underline text-primary hover:text-primary/80"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
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
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Memuat..." : "Login"}
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
            onClick={handleGoogleLogin}
          >
            <ChromeIcon className="mr-2 h-4 w-4" />
            Login dengan Google
          </Button>
        </CardContent>
        <CardContent className="mt-4 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="underline text-primary hover:text-primary/80"
          >
            Daftar Sekarang
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
