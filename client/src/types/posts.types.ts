export type PostType = "masjid" | "artikel";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  type: PostType;
  coverImage?: string;
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
}

export interface PostCategory {
  categoryId: string;
  category: { name: string };
}

export type UpdatePostPayload = Partial<CreatePostPayload>;
