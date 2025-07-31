"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokenCookie } from "@/utils/cookie.util";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      setTokenCookie(token);
      router.push("/");
      window.location.replace("/");
    } else {
      router.push("/login?error=missing_token");
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-sm w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          {/* Spinner */}
          <div className="mx-auto w-12 h-12 border-4 border-t-primary-600 border-gray-200 rounded-full animate-spin"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Mengarahkan...
        </h1>
        <p className="text-gray-500 mb-4">
          Login Google berhasil, harap tunggu.
        </p>
        <p className="text-sm text-gray-400">
          Jika tidak dialihkan dalam 5 detik, klik tombol di bawah.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
