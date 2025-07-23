import { UserRole } from "@prisma/client";

// 📌 Digunakan untuk endpoint `POST /users` (jika nanti ada tambah user)
export type CreateUserPayload = {
  email: string;
  fullname: string;
  password: string;
  role?: UserRole;
};

// 📌 Digunakan untuk endpoint `PATCH /users/:id`
export type UpdateUserPayload = {
  fullname?: string;
  role?: UserRole;
  isVerified?: boolean;
};

// 📌 Digunakan untuk `GET /users` response
export type UserListItem = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  avatar: string | null;
  isVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// 📌 Digunakan untuk `GET /users/:id` dan `/me`
export type UserDetail = UserListItem;

// 📌 Digunakan untuk response paginasi
export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

// 📌 Response lengkap dari `GET /users`
export type PaginatedUserResponse = {
  data: UserListItem[];
  paginations: PaginationMeta;
};
