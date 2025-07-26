import AxiosInstance from "@/lib/axios";
import type {
  PaginatedUserResponse,
  UpdateUserPayload,
  UserDetail,
} from "@/types/user.types";

export const UserService = {
  getMe: () => AxiosInstance.get<UserDetail>("/users/me"),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    AxiosInstance.get<PaginatedUserResponse>("/users", { params }),

  getUserById: (id: string) => AxiosInstance.get<UserDetail>(`/users/${id}`),

  updateUser: (id: string, data: UpdateUserPayload) =>
    AxiosInstance.put<UserDetail>(`/users/${id}`, data),

  deleteUser: (id: string) => AxiosInstance.delete<void>(`/users/${id}`),
};
