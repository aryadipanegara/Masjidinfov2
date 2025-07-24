import AxiosInstance from "@/lib/axios";

export const CategoryService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    AxiosInstance.get("/categories", { params }),

  getById: (id: string) => AxiosInstance.get(`/categories/${id}`),

  create: (name: string) => AxiosInstance.post("/categories", { name }),

  update: (id: string, name: string) =>
    AxiosInstance.put(`/categories/${id}`, { name }),

  delete: (id: string) => AxiosInstance.delete(`/categories/${id}`),
};
