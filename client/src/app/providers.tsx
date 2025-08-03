"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuthToken,
  isAuthenticated,
  getCurrentUser,
  setAuthToken,
  removeAuthToken,
} from "@/utils/auth";
import { UserService } from "@/service/users.service";
import { UserDetail } from "@/types/user.types";

interface AuthContextValue {
  user: UserDetail;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: {} as UserDetail,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(getAuthToken());
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (!token || !isAuthenticated()) {
        setUser(null);
      } else {
        try {
          const res = await UserService.getMe();
          setUser(res.data as UserDetail);
        } catch {
          const basic = getCurrentUser()!;
          setUser({
            id: basic.id,
            email: basic.email,
            role: "VIEWER",
            fullname: basic.email,
            avatar: undefined,
            isVerified: false,
            hasGoogleAccount: false,
            createdAt: "",
            updatedAt: "",
          } as UserDetail);
        }
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);

    try {
      const res = await UserService.getMe();
      setUser(res.data);
    } catch {
      const basic = getCurrentUser()!;
      setUser({
        id: basic.id,
        email: basic.email,
        role: "VIEWER",
        fullname: basic.email,
        avatar: undefined,
        isVerified: false,
        hasGoogleAccount: false,
        createdAt: "",
        updatedAt: "",
      } as UserDetail);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(undefined);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user: user ?? ({} as UserDetail), loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
