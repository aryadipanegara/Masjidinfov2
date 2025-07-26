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
      router.push("/dashboard");
    } else {
      router.push("/login?error=missing_token");
    }
  }, [params, router]);

  return <p>Mengarahkan setelah login Google...</p>;
}
