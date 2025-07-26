import AxiosInstance from "@/lib/axios";

export const AuthService = {
  // Login with email & password
  login: (data: { email: string; password: string }) =>
    AxiosInstance.post("/auth/login", data),

  register: (data: { email: string; fullname: string; password: string }) =>
    AxiosInstance.post("/auth/register", data),

  verifyOTP: (data: { email: string; code: string }) =>
    AxiosInstance.post("/auth/verify-otp", data),

  forgotPassword: (email: string) =>
    AxiosInstance.post("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    AxiosInstance.post("/auth/reset-password", data),

  refreshToken: () => AxiosInstance.post("/auth/refresh-token"),

  logout: () => AxiosInstance.post("/auth/logout"),

  // Login with Google
  getGoogleLoginUrl: () => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  },
};
