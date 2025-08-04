export type PostType =
  | "masjid"
  | "sejarah"
  | "kisah"
  | "ziarah"
  | "refleksi"
  | "tradisi";

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  type: PostType;
  coverImage?: string;
  status: PostStatus;
  viewCount: number;
  bookmarkCount: number;
  author: {
    id: string;
    fullname: string;
    email: string;
    avatar?: string;
  };
  categories: {
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  }[];
  images: {
    id: string;
    url: string;
    filename: string;
  }[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface CreatePostPayload {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  type: PostType;
  coverImage?: string;
  categoryIds?: string[];
  imageIds?: string[];
  status: PostStatus;
  isDeleted?: boolean;
  viewCount?: number;
}

export interface PostCategory {
  id: string;
  categoryId: string;
  category: { name: string };
  name: string;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;
