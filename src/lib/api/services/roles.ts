import { instance } from "./axios";

/** Mirrors the backend RBAC DTOs (PermissionDto / RoleDto). Flat, numeric ids. */
export interface PermissionDto {
  id: number;
  name: string;
  description: string | null;
}

export interface RoleDto {
  id: number;
  name: string;
  description: string | null;
  permissions: PermissionDto[];
}

/** GET /api/roles — all roles with their assigned permissions (super admin). */
export const listRoles = () =>
  instance.get<RoleDto[]>("/roles").then((r) => r.data);

/** GET /api/permissions — the full permission catalog (super admin). */
export const listPermissions = () =>
  instance.get<PermissionDto[]>("/permissions").then((r) => r.data);

/** PUT /api/roles/:id/permissions — replace a role's permission set. */
export const updateRolePermissions = (roleId: number, permissionIds: number[]) =>
  instance
    .put<RoleDto>(`/roles/${roleId}/permissions`, { permissionIds })
    .then((r) => r.data);
