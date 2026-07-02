import { instance } from "./axios";
import type { Tenant, TenantStatus } from "@/types";

export const list = () =>
  instance.get<Tenant[]>("/admin/tenants").then((r) => r.data);

export const get = (id: string) =>
  instance
    .get<Tenant>(`/admin/tenants/${id}`)
    .then((r) => r.data);

export const updateStatus = (id: string, status: TenantStatus) =>
  instance
    .patch<Tenant>(`/admin/tenants/${id}/status`, { status })
    .then((r) => r.data);
