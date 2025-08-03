"use client";

import type React from "react";

import { useState } from "react";
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
import { AuthService } from "@/service/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToastId = notify.loading("Mengirim tautan reset password...");

    try {
      const res = await AuthService.forgotPassword(email);
      const data = res.data;

      notify.dismiss(loadingToastId);
      notify.success(
        data.message || "Tautan reset password telah dikirim ke email Anda."
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
          <CardTitle className="text-3xl font-bold">Lupa Password</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Masukkan email Anda untuk menerima tautan reset password
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleForgotPassword} className="grid gap-4">
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
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
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
