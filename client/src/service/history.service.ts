import AxiosInstance from "@/lib/axios";

export const HistoryService = {
  // Ambil semua riwayat baca user
  getAll: (params?: { page?: number; limit?: number }) =>
    AxiosInstance.get("/history", { params }),

  // Hapus history untuk satu post
  remove: (postId: string) => AxiosInstance.delete(`/history/${postId}`),
};
