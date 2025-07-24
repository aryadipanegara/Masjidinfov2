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
  upload: async (file: File): Promise<{ data: ImageUploadResponse }> => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await AxiosInstance.post<ImageUploadResponse>(
      "/images/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  getAll: async (postId?: string): Promise<{ data: ImageListResponse }> => {
    const params = postId ? { postId } : {};
    const response = await AxiosInstance.get<ImageListResponse>("/images", {
      params,
    });
    return response;
  },

  getById: async (id: string): Promise<{ data: ImageDetailResponse }> => {
    const response = await AxiosInstance.get<ImageDetailResponse>(
      `/images/${id}`
    );
    return response;
  },

  update: async (
    id: string,
    data: UpdateImagePayload
  ): Promise<{ data: ImageUpdateResponse }> => {
    const response = await AxiosInstance.put<ImageUpdateResponse>(
      `/images/${id}`,
      data
    );
    return response;
  },

  delete: async (id: string): Promise<{ data: ImageDeleteResponse }> => {
    const response = await AxiosInstance.delete<ImageDeleteResponse>(
      `/images/${id}`
    );
    return response;
  },
};
