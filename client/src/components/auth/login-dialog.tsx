"use client";

import { useState } from "react";
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

export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!validatePassword(password)) return;

    setSubmitting(true);
    const toastId = notify.loading("Sedang login...");
    try {
      const res = await AuthService.login({ email, password });
      const { token } = res.data;
      await login(token);
      notify.dismiss(toastId);
      onOpenChange(false);
      router.push("/"); // atau redirect wherever
    } catch (err) {
      handleErrorResponse(err, toastId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = AuthService.getGoogleLoginUrl();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          {/* Submit */}
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
          <a
            href="/register"
            className="underline text-primary hover:text-primary/80"
          >
            Daftar Sekarang
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
