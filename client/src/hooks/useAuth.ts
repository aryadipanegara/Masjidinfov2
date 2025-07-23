"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/service/users.service";

type User = {
  id: string;
  email: string;
  fullname: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  hasGoogleAccount: boolean;
};

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
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
