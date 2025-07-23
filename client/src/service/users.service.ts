import AxiosInstance from "@/lib/axios";

export const UserService = {
  getMe: () => AxiosInstance.get("/me"),
};
