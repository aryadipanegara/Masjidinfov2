import { PostStatus, PostType, Prisma } from "@prisma/client";

export type CreatePostPayload = {
  type: "masjid" | "sejarah" | "kisah" | "ziarah" | "refleksi" | "tradisi";
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  categoryIds?: string[];
  imageIds?: string[];
  allImageConnections?: string[] | undefined;
  status?: "DRAFT" | "PUBLISHED";
};

/**
 * Opsi untuk fetch daftar post:
 * - paging, pencarian, filter by type/category
 * - filter status (default hanya PUBLISHED), atau showAll untuk admin
 */
export interface GetPostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: PostType;
  categoryId?: string;
  showAll?: boolean;
  status?: PostStatus;
  orderBy?: Prisma.PostOrderByWithRelationInput;
}
