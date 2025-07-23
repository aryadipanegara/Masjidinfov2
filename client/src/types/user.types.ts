// Untuk detail satu user
export type UserDetail = {
  id: string;
  email: string;
  fullname: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  avatar?: string | null;
  isVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: string;
  updatedAt: string;
};

// Untuk payload update user
export type UpdateUserPayload = Partial<
  Pick<UserDetail, "fullname" | "role" | "isVerified">
>;

// Untuk response dari getUsers (daftar user + pagination)
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
