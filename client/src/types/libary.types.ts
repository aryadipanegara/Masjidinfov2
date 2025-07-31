export interface BookmarkItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  coverImage?: string;
  excerpt?: string;
  createdAt: string;
  author: {
    id: string;
    fullname: string;
    avatar?: string;
  };
  categories?: Array<{
    category: {
      name: string;
    };
  }>;

  postId?: string;
}

export interface ReadlistItem {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    posts: number;
  };
  posts?: Array<{
    id: string;
    postId: string;
    addedAt: string;
    post: {
      id: string;
      title: string;
      slug: string;
      type: string;
      coverImage?: string;
      excerpt?: string;
      author: {
        id: string;
        fullname: string;
        avatar?: string;
      };
      categories: Array<{
        category: {
          name: string;
        };
      }>;
    };
  }>;
}

export interface HistoryItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  coverImage?: string;
  excerpt?: string;
  createdAt: string;
  publishedAt: string;
  author: {
    id: string;
    fullname: string;
    avatar?: string;
  };
  categories?: Array<{
    category: {
      name: string;
    };
  }>;

  postId?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
