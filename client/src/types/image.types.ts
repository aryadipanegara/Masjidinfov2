export interface Image {
  id: string;
  url: string;
  altText?: string | null;
  caption?: string | null;
  originalName?: string;
  order: number;
  uploadedAt: string;
  postId?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    fullname: string;
    avatar?: string;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: Image;
}

export interface ImageListResponse {
  data: Image[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ImageDetailResponse {
  success: boolean;
  data: Image;
}

export interface UpdateImagePayload {
  altText?: string;
  caption?: string;
  postId?: string;
  order?: number;
}

export interface ImageUpdateResponse {
  success: boolean;
  message: string;
  data: Image;
}

export interface ImageDeleteResponse {
  success: boolean;
  message: string;
}
