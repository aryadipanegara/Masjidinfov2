import AxiosInstance from "@/lib/axios";

export const CommentService = {
  getByPostId: (
    postId: string,
    params?: { page?: number; limit?: number; sort?: "recent" | "popular" }
  ) => AxiosInstance.get(`/comments/${postId}/comments`, { params }),

  create: (postId: string, content: string, parentId?: string) =>
    AxiosInstance.post(`/comments/${postId}/comments`, { content, parentId }),

  like: (commentId: string) =>
    AxiosInstance.post(`/comments/${commentId}/like`),

  unlike: (commentId: string) =>
    AxiosInstance.delete(`/comments/${commentId}/like`),

  update: (commentId: string, content: string) =>
    AxiosInstance.patch(`/comments/ ${commentId}`, { content }),

  delete: (commentId: string) => AxiosInstance.delete(`comments/${commentId}`),
};
