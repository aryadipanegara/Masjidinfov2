export interface Image {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  postId: string | null;
  order: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateImagePayload {
  file: File;
  altText?: string;
  caption?: string;
  postId?: string;
}

export type UpdateImagePayload = Partial<{
  altText: string;
  caption: string;
  order: number;
}>;

export interface ImageUploadResponse {
  message: string;
  data: Image;
}

export interface ImageListResponse {
  message: string;
  images: Image[];
  count: number;
}

export interface ImageDetailResponse {
  message: string;
  data: Image;
}

export interface ImageUpdateResponse {
  message: string;
  updatedImage: Image;
}

export interface ImageDeleteResponse {
  message: string;
}
