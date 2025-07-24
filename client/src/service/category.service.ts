import AxiosInstance from "@/lib/axios";

export const CategoryService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    AxiosInstance.get("/category", { params }),

  getById: (id: string) => AxiosInstance.get(`/category/${id}`),

  create: (name: string) => AxiosInstance.post("/category", { name }),

  update: (id: string, name: string) =>
    AxiosInstance.put(`/category/${id}`, { name }),

  delete: (id: string) => AxiosInstance.delete(`/category/${id}`),
};
