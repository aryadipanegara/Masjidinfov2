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

interface UserProfile {
  id: string;
  email: string;
  role: string;
  fullname: string;
  avatar?: string;
}
interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(getAuthToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (!token || !isAuthenticated()) {
        setUser(null);
      } else {
        try {
          const res = await UserService.getMe();
          setUser(res.data);
        } catch {
          const basic = getCurrentUser()!;
          setUser({ ...basic, fullname: basic.email, avatar: undefined });
        }
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    removeAuthToken();
    setToken(undefined);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
