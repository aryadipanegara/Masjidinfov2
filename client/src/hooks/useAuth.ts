"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, isAuthenticated, removeAuthToken } from "@/utils/auth";

export interface User {
  id: string;
  email: string;
  role: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return { user, loading, logout };
}
