import { instance } from "./axios";
import type { ApiResponse } from "./types";
import type { Tenant, TenantStatus } from "@/types";

export const list = () =>
  instance.get<ApiResponse<Tenant[]>>("/admin/tenants").then((r) => r.data.data);

export const get = (id: string) =>
  instance
    .get<ApiResponse<Tenant>>(`/admin/tenants/${id}`)
    .then((r) => r.data.data);

export const updateStatus = (id: string, status: TenantStatus) =>
  instance
    .patch<ApiResponse<Tenant>>(`/admin/tenants/${id}/status`, { status })
    .then((r) => r.data.data);
