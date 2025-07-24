import AxiosInstance from "@/lib/axios";
import { CreateMasjidPayload, UpdateMasjidPayload } from "@/types/masjid.types";

export const MasjidService = {
  getByPostId: (postId: string) => AxiosInstance.get(`/masjids/${postId}`),
  create: (postId: string, data: CreateMasjidPayload) =>
    AxiosInstance.post(`/masjids/${postId}`, data),
  update: (postId: string, data: UpdateMasjidPayload) =>
    AxiosInstance.put(`/masjids/${postId}`, data),
};
