import AxiosInstance from "@/lib/axios";

export const BookmarkService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    AxiosInstance.get("/bookmarks", { params }),

  add: (postId: string) => AxiosInstance.post(`/bookmarks/${postId}`),

  remove: (postId: string) => AxiosInstance.delete(`/bookmarks/${postId}`),
};
