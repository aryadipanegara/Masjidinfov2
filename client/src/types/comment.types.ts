export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  postId: string;
  authorId: string;
  parentId?: string;
  author: {
    id: string;
    fullname: string;
    username?: string;
    avatar?: string;
    role?: string;
  };
  _count: {
    likes: number;
    replies?: number;
  };
  replies?: Comment[];
  isLiked: boolean;
  totalLikes: number;
  totalReplies: number;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  sort?: "recent" | "popular" | "oldest";
}

export interface CommentResponse {
  data: Comment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
