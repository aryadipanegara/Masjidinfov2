export type GetImagesOptions = {
  page?: number;
  limit?: number;
  search?: string;
  postId?: string;
  uploadedById?: string;
  includeDeleted?: boolean;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  sort?: "newest" | "oldest" | "order-asc" | "order-desc";
};
