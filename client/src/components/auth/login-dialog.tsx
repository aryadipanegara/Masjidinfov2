"use client";

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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
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
    if (!validatePassword(password)) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isDesktop ? (
        // DESKTOP VERSION
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
            <a
              href="/register"
              className="underline text-primary hover:text-primary/80"
            >
              Daftar Sekarang
            </a>
          </p>
        </DialogContent>
      ) : (
        // MOBILE VERSION
        <DialogContent
          className="max-w-none fixed bottom-0 inset-x-0 w-full h-[40vh] m-0 p-0 top-auto rounded-t-xl translate-x-0 translate-y-0 items-center bg-background"
          aria-label="Mobile login sheet"
        >
          <div className="flex flex-col h-full">
            <div className="py-3 flex justify-center">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            <div className="px-6 pb-4">
              <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
            </div>

            <div className="flex border-b border-border mx-6">
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  mobileTab === "social"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMobileTab("social")}
              >
                Social
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
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
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {mobileTab === "social" ? (
                <div className="space-y-3">
                  {/* Google Login */}
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start bg-background border-border hover:bg-muted"
                    onClick={handleGoogleLogin}
                  >
                    <ChromeIcon className="mr-3 h-5 w-5" />
                    <span className="flex-1 text-left">Google</span>
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email-mobile"
                      className="text-sm font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email-mobile"
                      type="email"
                      placeholder="nama@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password-mobile"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      <a
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 underline"
                      >
                        Lupa Password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password-mobile"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        required
                        className="pr-10 h-12"
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
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                  </div>

                  <Button
                    disabled={submitting}
                    type="submit"
                    className="w-full h-12"
                  >
                    {submitting ? "Loading..." : "Masuk"}
                  </Button>
                </form>
              )}
            </div>

            {/* Cancel Button */}
            <div className="px-6 py-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full h-12 text-muted-foreground hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
