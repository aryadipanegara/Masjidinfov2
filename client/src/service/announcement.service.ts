import AxiosInstance from "@/lib/axios";

export const AnnouncementService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    AxiosInstance.get("/announcement", { params }),

  getById: (id: string) => AxiosInstance.get(`/announcement/${id}`),

  create: (data: { content: string }) =>
    AxiosInstance.post("/announcement", data),

  update: (id: string, content: string) =>
    AxiosInstance.put(`/announcement/${id}`, { content }),

  delete: (id: string) => AxiosInstance.delete(`/announcement/${id}`),
};
