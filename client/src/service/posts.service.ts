import AxiosInstance from "@/lib/axios";
import {
  Post,
  CreatePostPayload,
  UpdatePostPayload,
} from "@/types/posts.types";

export const PostService = {
  /**
   * 🔹 Daftar post terbaru (default)
   */
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    categoryId?: string;
  }) =>
    AxiosInstance.get<{
      data: Post[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>("/posts", { params }),

  /**
   * 🔥 Daftar post paling populer (berdasarkan viewCount)
   */
  getPopular: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    categoryId?: string;
  }) =>
    AxiosInstance.get<{
      data: Post[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>("/posts/popular", { params }),

  /**
   * 🌟 Daftar post rekomendasi (gabungan view + bookmark)
   */
  getRecommended: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    categoryId?: string;
  }) =>
    AxiosInstance.get<{
      data: Post[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>("/posts/recommended", { params }),

  /**
   * 🔍 Ambil post berdasarkan slug
   */
  getBySlug: (slug: string) => AxiosInstance.get(`/posts/slug/${slug}`),

  /**
   * 📝 Update post berdasarkan slug
   */
  updateBySlug: (slug: string, data: Partial<CreatePostPayload>) =>
    AxiosInstance.put(`/posts/slug/${slug}`, data),

  /**
   * 🔎 Ambil post berdasarkan ID
   */
  getById: (id: string) => AxiosInstance.get<Post>(`/posts/${id}`),

  /**
   * ➕ Buat post baru
   */
  create: (data: CreatePostPayload) => AxiosInstance.post<Post>("/posts", data),

  /**
   * ✏️ Update post berdasarkan ID
   */
  update: (id: string, data: UpdatePostPayload) =>
    AxiosInstance.put<Post>(`/posts/${id}`, data),

  /**
   * ❌ Hapus post
   */
  delete: (id: string) => AxiosInstance.delete(`/posts/${id}`),
};
