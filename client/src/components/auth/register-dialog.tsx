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

export function RegisterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
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
    const toastId = notify.loading("Sedang mendaftar...");
    try {
      const res = await AuthService.register({ email, fullname, password });
      notify.dismiss(toastId);
      notify.success(res.data.message || "Registrasi berhasil!");
      localStorage.setItem("registeredEmail", email);
      onOpenChange(false);
      router.push("/verify-otp");
    } catch (err: unknown) {
      handleErrorResponse(err, toastId);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Akun Baru</DialogTitle>
          <DialogDescription>
            Daftar untuk memulai perjalanan Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegister} className="grid gap-4 mt-4">
          {/* Nama Lengkap */}
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
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1 grid gap-1">
              <p
                className={
                  passwordValidation.length ? "text-green-600" : "text-red-500"
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
                Setidaknya 1 huruf besar
              </p>
              <p
                className={
                  passwordValidation.lowercase
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Setidaknya 1 huruf kecil
              </p>
              <p
                className={
                  passwordValidation.number ? "text-green-600" : "text-red-500"
                }
              >
                Setidaknya 1 angka
              </p>
              <p
                className={
                  passwordValidation.specialChar
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Setidaknya 1 karakter spesial
              </p>
            </div>
          </div>

          {/* Konfirmasi Password */}
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
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {!passwordValidation.match && confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Password tidak cocok.</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-10" disabled={!isFormValid}>
            {loading ? "Memuat..." : "Daftar"}
          </Button>
        </form>

        {/* Separator & Google */}
        <div className="relative my-4">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2">Atau lanjutkan dengan</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={handleGoogleRegister}
        >
          <ChromeIcon className="mr-2 h-4 w-4" />
          Daftar dengan Google
        </Button>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <button
            className="underline text-primary hover:text-primary/80"
            onClick={() => {
              onOpenChange(false);
              // buka login modal kalau perlu
              // setLoginOpen(true);
            }}
          >
            Login
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
