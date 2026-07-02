import { instance } from "./axios";

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: string;
  tenantName: string | null;
  createdAt: string;
}

/** Mirrors the backend PageResponse (page is 0-based). */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/** GET /api/users — paginated, optionally searched by name/email. */
export const listUsers = (params: { page: number; size: number; search?: string }) =>
  instance
    .get<Page<UserSummary>>("/users", {
      params: { page: params.page, size: params.size, search: params.search || undefined },
    })
    .then((r) => r.data);

/** PUT /api/users/:id/role — reassign a user to a different role. */
export const updateUserRole = (id: number, roleId: number) =>
  instance.put<UserSummary>(`/users/${id}/role`, { roleId }).then((r) => r.data);
