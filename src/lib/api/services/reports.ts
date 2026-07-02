import { instance } from "./axios";
import type { ApiResponse } from "./types";
import type { AgingBucket, DashboardStats, RevenuePoint } from "@/types";

export const dashboard = () =>
  instance
    .get<ApiResponse<DashboardStats>>("/reports/dashboard")
    .then((r) => r.data.data);

export const revenue = () =>
  instance
    .get<ApiResponse<RevenuePoint[]>>("/reports/revenue")
    .then((r) => r.data.data);

export const aging = () =>
  instance
    .get<ApiResponse<AgingBucket[]>>("/reports/aging")
    .then((r) => r.data.data);
