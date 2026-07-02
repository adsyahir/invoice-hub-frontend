import { instance } from "./axios";
import type { AgingBucket, DashboardStats, RevenuePoint } from "@/types";

export const dashboard = () =>
  instance
    .get<DashboardStats>("/reports/dashboard")
    .then((r) => r.data);

export const revenue = () =>
  instance
    .get<RevenuePoint[]>("/reports/revenue")
    .then((r) => r.data);

export const aging = () =>
  instance
    .get<AgingBucket[]>("/reports/aging")
    .then((r) => r.data);
