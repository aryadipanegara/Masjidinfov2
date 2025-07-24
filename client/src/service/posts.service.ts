import AxiosInstance from "@/lib/axios";
import {
  Post,
  CreatePostPayload,
  UpdatePostPayload,
} from "@/types/posts.types";

export const PostService = {
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

  getBySlug: (slug: string) => AxiosInstance.get(`/posts/slug/${slug}`),

  updateBySlug: (slug: string, data: Partial<CreatePostPayload>) =>
    AxiosInstance.put(`/posts/slug/${slug}`, data),

  getById: (id: string) => AxiosInstance.get<Post>(`/posts/${id}`),

  create: (data: CreatePostPayload) => AxiosInstance.post<Post>("/posts", data),

  update: (id: string, data: UpdatePostPayload) =>
    AxiosInstance.put<Post>(`/posts/${id}`, data),

  delete: (id: string) => AxiosInstance.delete(`/posts/${id}`),
};
