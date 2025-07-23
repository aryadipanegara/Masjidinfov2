"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { AuthService } from "@/service/auth.service";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("registeredEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/register");
    }
  }, [router]);

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      notify.error("Kode OTP harus 6 digit.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    const loadingToastId = notify.loading("Memverifikasi OTP...");

    try {
      const res = await AuthService.verifyOTP({ email, code: otpCode });
      const data = res.data;

      notify.dismiss(loadingToastId);
      notify.success(data.message || "Verifikasi berhasil!");
      setSuccess(true);

      localStorage.removeItem("registeredEmail");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      notify.error("Email tidak ditemukan untuk mengirim ulang OTP.");
      return;
    }

    setLoading(true);
    const loadingToastId = notify.loading("Mengirim ulang OTP...");

    try {
      // Untuk mengirim ulang OTP, kita akan memanggil endpoint forgotPassword
      // karena ini akan memicu pengiriman OTP baru ke email yang sama.
      const res = await AuthService.forgotPassword(email);
      const data = res.data;

      notify.dismiss(loadingToastId);
      notify.success(
        data.message || "Kode OTP baru telah dikirim ke email Anda."
      );
    } catch (err: unknown) {
      handleErrorResponse(err, loadingToastId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Verifikasi OTP</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Masukkan kode OTP yang telah dikirim ke email{" "}
            <span className="font-medium text-foreground">
              {email || "Anda"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                disabled={loading || success}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {success && (
            <Alert
              variant="default"
              className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription>
                Verifikasi berhasil! Anda akan dialihkan ke halaman login.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleVerifyOTP}
            className="w-full h-10"
            disabled={loading || success || otpCode.length !== 6}
          >
            {loading ? "Memverifikasi..." : "Verifikasi OTP"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={loading || success}
              className="p-0 h-auto"
            >
              Tidak menerima kode? Kirim ulang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
