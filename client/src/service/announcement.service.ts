import AxiosInstance from "@/lib/axios";
import { Announcement, AnnouncementResponse } from "@/types/announcement.types";

export const AnnouncementService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    AxiosInstance.get<AnnouncementResponse>("/announcement", { params }),

  getById: (id: string) =>
    AxiosInstance.get<{ data: Announcement }>(`/announcement/${id}`),

  create: (data: { content: string }) =>
    AxiosInstance.post<{ data: Announcement }>("/announcement", data),

  update: (id: string, content: string) =>
    AxiosInstance.put<{ data: Announcement }>(`/announcement/${id}`, {
      content,
    }),

  delete: (id: string) =>
    AxiosInstance.delete<{ message: string }>(`/announcement/${id}`),
};
