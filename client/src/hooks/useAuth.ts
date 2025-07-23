"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/service/users.service";
import { UserDetail } from "@/types/user.types";

export default function useAuth() {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    UserService.getMe()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
        router.push("login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return { user, loading };
}
