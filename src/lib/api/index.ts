/**
 * Single entry point for every backend service.
 *
 *   import { api } from "@/lib/api";
 *
 *   await api.auth.login(username, password);
 *   const invoices = await api.invoices.list({ status: "OVERDUE" });
 *   await api.payments.refund(paymentId, { amount: 100 });
 *
 * Each domain is its own module in this folder. Add a new service by creating
 * `src/lib/api/<domain>.ts` and registering it below.
 */
import * as auth from "./services/auth";
import * as invoices from "./services/invoices";
import * as clients from "./services/clients";
import * as payments from "./services/payments";
import * as reports from "./services/reports";
import * as notifications from "./services/notifications";
import * as team from "./services/team";
import * as tenants from "./services/tenants";
import * as roles from "./services/roles";
import * as users from "./services/users";
import * as geo from "./services/geo";
import * as settings from "./services/settings";

export const api = {
  auth,
  invoices,
  clients,
  payments,
  reports,
  notifications,
  team,
  tenants,
  roles,
  users,
  geo,
  settings,
};

export type Api = typeof api;
export { instance } from "./services/axios";
export default api;
