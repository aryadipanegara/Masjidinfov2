import AxiosInstance from "@/lib/axios";

export const ReadlistService = {
  // Ambil daftar readlist milik user
  getAll: (params?: { page?: number; limit?: number }) =>
    AxiosInstance.get("/readlist", { params }),

  // Buat readlist baru
  create: (name: string) => AxiosInstance.post("/readlist", { name }),

  // Tambah post ke dalam readlist
  addPost: (readListId: string, postId: string) =>
    AxiosInstance.post(`/readlist/${readListId}/posts`, { postId }),

  // Hapus post dari readlist
  removePost: (readListId: string, postId: string) =>
    AxiosInstance.delete(`/readlist/${readListId}/posts/${postId}`),

  // Ambil semua post dalam 1 readlist
  getPosts: (readListId: string, params?: { page?: number; limit?: number }) =>
    AxiosInstance.get(`/readlist/${readListId}/posts`, { params }),
};
