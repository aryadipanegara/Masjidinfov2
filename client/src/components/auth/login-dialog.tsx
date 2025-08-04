"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChromeIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { AuthService } from "@/service/auth.service";
import { useAuth } from "@/app/providers";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}

export function LoginDialog({
  open,
  onOpenChange,
  onSwitchToRegister,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSwitchToRegister: () => void;
}) {
  const router = useRouter();
  const { login } = useAuth();
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mobileTab, setMobileTab] = useState<"social" | "password">("social");

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
    if (mobileTab === "password" && !validatePassword(password)) return;
    setSubmitting(true);
    const toastId = notify.loading("Sedang login...");
    try {
      const res = await AuthService.login({ email, password });
      await login(res.data.token);
      notify.dismiss(toastId);
      onOpenChange(false);
      router.push("/");
    } catch (err) {
      handleErrorResponse(err, toastId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = AuthService.getGoogleLoginUrl();
  };

  const handleSwitchToRegister = () => {
    onOpenChange(false);
    onSwitchToRegister();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isDesktop ? (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selamat Datang Kembali!</DialogTitle>
            <DialogDescription>
              Masuk ke akun Anda untuk melanjutkan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="grid gap-4 mt-4">
            {/* Email */}
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
            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-sm underline text-primary hover:text-primary/80"
                >
                  Lupa Password?
                </a>
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
            <Button disabled={submitting} type="submit" className="w-full h-10">
              {submitting ? "Loading..." : "Masuk"}
            </Button>
          </form>
          {/* Separator */}
          <div className="relative my-4">
            <Separator />
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>
          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full h-10 bg-transparent"
            onClick={handleGoogleLogin}
          >
            <ChromeIcon className="mr-2 h-4 w-4" />
            Login dengan Google
          </Button>
          {/* Footer */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={handleSwitchToRegister}
              className="underline text-primary hover:text-primary/80"
            >
              Daftar Sekarang
            </button>
          </p>
        </DialogContent>
      ) : (
        // MOBILE VERSION
        <DialogContent
          className="max-w-none fixed bottom-0 inset-x-0 w-full max-h-[90vh] m-0 p-0 top-auto rounded-t-xl translate-x-0 translate-y-0 items-center bg-background flex flex-col"
          aria-label="Mobile login sheet"
        >
          {/* Handle bar */}
          <div className="py-3 flex justify-center">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>

          {/* Tabs */}
          <div className="flex w-full px-6 border-b border-border">
            <button
              className={`flex-1 py-3 text-center font-semibold transition-colors ${
                mobileTab === "social"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMobileTab("social")}
            >
              Social
            </button>
            <button
              className={`flex-1 py-3 text-center font-semibold transition-colors ${
                mobileTab === "password"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMobileTab("password")}
            >
              Password
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 w-full">
            {mobileTab === "social" ? (
              <div className="space-y-6 flex flex-col items-center justify-center h-full">
                {/* Google Login */}
                <Button
                  variant="outline"
                  className="w-full max-w-xs h-12 justify-center bg-background border-border hover:bg-muted"
                  onClick={handleGoogleLogin}
                >
                  <ChromeIcon className="mr-3 h-5 w-5" />
                  <span className="text-base">Login dengan Google</span>
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={handleSwitchToRegister}
                    className="underline text-primary hover:text-primary/80"
                  >
                    Daftar Sekarang
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-4">
                  Login with Password
                </h2>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email-mobile" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email-mobile"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password-mobile" className="sr-only">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password-mobile"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      required
                      className="pr-10 h-12 text-base"
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
                <Button
                  disabled={submitting}
                  type="submit"
                  className="w-full h-12 text-base"
                >
                  {submitting ? "Loading..." : "Login"}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Untuk mendapatkan password lihat tutorial ini:{" "}
                  <a
                    href="/forgot-password"
                    className="underline text-primary hover:text-primary/80"
                  >
                    Mengatur Password
                  </a>
                </p>
              </form>
            )}
          </div>
          {/* Cancel Button */}
          <div className="px-6 py-4 border-t border-border w-full">
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-foreground text-base"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
