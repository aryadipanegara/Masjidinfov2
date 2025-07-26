export type UserDetail = {
  id: string;
  email: string;
  fullname: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  avatar?: string | undefined;
  isVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserPayload = Partial<
  Pick<UserDetail, "fullname" | "role" | "isVerified">
>;

export type CreateUserPayload = {
  email: string;
  fullname: string;
  password?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  isVerified?: boolean;
};

export type PaginatedUserResponse = {
  data: UserDetail[];
  paginations: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};
