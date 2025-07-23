import AxiosInstance from "@/lib/axios";
import type {
  PaginatedUserResponse,
  UpdateUserPayload,
  UserDetail,
} from "@/types/user.types";

export const UserService = {
  // Ambil data user yang sedang login
  getMe: () => AxiosInstance.get<UserDetail>("/users/me"),

  // Ambil semua user dengan query search dan pagination
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    AxiosInstance.get<PaginatedUserResponse>("/users", { params }),

  // Ambil 1 user berdasarkan ID
  getUserById: (id: string) => AxiosInstance.get<UserDetail>(`/users/${id}`),

  // Update user
  updateUser: (id: string, data: UpdateUserPayload) =>
    AxiosInstance.put<UserDetail>(`/users/${id}`, data),

  // Hapus user
  deleteUser: (id: string) => AxiosInstance.delete<void>(`/users/${id}`),
};
