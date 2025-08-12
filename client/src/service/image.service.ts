import AxiosInstance from "@/lib/axios";
import type {
  ImageUploadResponse,
  ImageListResponse,
  ImageDetailResponse,
  UpdateImagePayload,
  ImageUpdateResponse,
  ImageDeleteResponse,
} from "@/types/image.types";

export const ImageService = {
  upload: async (
    file: File,
    opts?: { altText?: string; caption?: string; postId?: string }
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (opts?.altText) formData.append("altText", opts.altText);
    if (opts?.caption) formData.append("caption", opts.caption);
    if (opts?.postId) formData.append("postId", opts.postId);

    const { data } = await AxiosInstance.post<ImageUploadResponse>(
      "/images/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    postId?: string;
    uploadedById?: string;
    sort?: "newest" | "oldest" | "order-asc" | "order-desc";
    includeDeleted?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ImageListResponse> => {
    const { data } = await AxiosInstance.get<ImageListResponse>("/images", {
      params,
      withCredentials: true,
    });
    return data;
  },

  getById: async (id: string): Promise<ImageDetailResponse> => {
    const { data } = await AxiosInstance.get<ImageDetailResponse>(
      `/images/${id}`,
      { withCredentials: true }
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateImagePayload
  ): Promise<ImageUpdateResponse> => {
    const { data } = await AxiosInstance.put<ImageUpdateResponse>(
      `/images/${id}`,
      payload,
      { withCredentials: true }
    );
    return data;
  },

  delete: async (id: string): Promise<ImageDeleteResponse> => {
    const { data } = await AxiosInstance.delete<ImageDeleteResponse>(
      `/images/${id}`,
      { withCredentials: true }
    );
    return data;
  },
};
