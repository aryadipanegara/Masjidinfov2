export type Announcement = {
  id: string;
  message: string;
  createdAt: string;
  isActive: boolean;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AnnouncementResponse = {
  data: Announcement[];
  pagination: Pagination;
};
