/**
 * React Query hooks for InvoiceHub.
 *
 * Each hook's `queryFn`/`mutationFn` is the ONE place to swap mock data for a
 * real API call (search for `TODO(backend)`). Components depend only on these
 * hooks, never on the mock fixtures directly.
 */
import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Client,
  Invoice,
  InvoiceStatus,
  SubscriptionPlan,
  TenantStatus,
} from "@/types";
import { mockDelay } from "./client";
import * as clientsApi from "./clients";
import * as invoicesApi from "./invoices";
import * as paymentsApi from "./payments";
import * as reportsApi from "./reports";
import * as notificationsApi from "./notifications";
import * as searchApi from "./search";
import * as tenantsApi from "./tenants";
import * as teamsApi from "./team";

import {
  mockInvoices,
  mockPlans,
} from "@/lib/mock/data";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  revenue: ["revenue"] as const,
  aging: ["aging"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoices", id] as const,
  invoiceAudit: (id: string) => ["invoices", id, "audit"] as const,
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  payments: ["payments"] as const,
  team: ["team"] as const,
  tenants: ["tenants"] as const,
  plans: ["plans"] as const,
  notifications: ["notifications"] as const,
  search: (q: string) => ["search", q] as const,
};

// ---- Invoices ----

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | "ALL";
  clientId?: string | "ALL";
}

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.invoices, filters],
    queryFn: async () => {
      let rows = await invoicesApi.list();
      if (filters.status && filters.status !== "ALL") {
        rows = rows.filter((i) => i.status === filters.status);
      }
      if (filters.clientId && filters.clientId !== "ALL") {
        rows = rows.filter((i) => i.clientId === filters.clientId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(q) ||
            i.client?.name.toLowerCase().includes(q),
        );
      }
      rows.sort((a, b) => b.issueDate.localeCompare(a.issueDate));
      return mockDelay(rows);
    },
    // Same reason as useInvoice: keep refreshing only while some invoice is waiting on
    // LHDN, so a PENDING badge in the table resolves itself once the consumer lands.
    refetchInterval: (query) =>
      query.state.data?.some((i) => i.einvoiceStatus === "PENDING") ? 3000 : false,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoice(id ?? ""),
    enabled: !!id,
    queryFn: () => invoicesApi.get(id!),
    // MyInvois submission is asynchronous: POST /submit-einvoice returns PENDING, and a
    // Kafka consumer flips the invoice to VALIDATED (or REJECTED) once LHDN answers. Poll
    // while that is in flight so the badge updates on its own, then stop — no point
    // polling an invoice whose e-invoice status is settled.
    refetchInterval: (query) =>
      query.state.data?.einvoiceStatus === "PENDING" ? 3000 : false,
  });
}

export function useInvoiceAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoiceAudit(id ?? ""),
    enabled: !!id,
    queryFn: () => invoicesApi.getAuditLog(id!),
  });
}

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.payments, "invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: () => invoicesApi.getPayments(invoiceId!),
  });
}

/** Public, unauthenticated invoice lookup by payment-link token. */
export function usePublicInvoice(token: string | undefined) {
  return useQuery({
    queryKey: ["public-invoice", token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      // TODO(backend): GET /pay/{token}  (no auth; resolves the tokenized link)
      if (token === "expired") throw new Error("EXPIRED");
      const invoice =
        mockInvoices.find((i) => i.status === "SENT" && i.paymentLinkToken) ??
        mockInvoices[3];
      return mockDelay<Invoice>(invoice);
    },
  });
}

// ---- Clients ----

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => clientsApi.list(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,   // ✅ add this
  });
}

// Manual fetch (no React Query) — useState + useEffect spelled out.
export function useClient(id: string | undefined) {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // No id (e.g. the "new client" page) → don't fetch.
    if (!id) {
      setClient(undefined);
      return;
    }

    setIsLoading(true);
    clientsApi
      .get(id)
      .then((data) => setClient(data))
      .catch((err) => {
        console.error("Failed to load client:", err);
        setClient(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  return { data: client, isLoading };
}

// ---- Payments ----

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: () => paymentsApi.list(),
  });
}

// ---- Dashboard / reports ----

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => reportsApi.dashboard(),
  });
}

export function useRevenueSeries() {
  return useQuery({
    queryKey: queryKeys.revenue,
    queryFn: () => reportsApi.revenue(),
  });
}

export function useAgingReport() {
  return useQuery({
    queryKey: queryKeys.aging,
    queryFn: () => reportsApi.aging(),
  });
}

// ---- Notifications (topbar bell) ----

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsApi.feed(),
    // Light polling so the bell stays current without a websocket.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

// ---- Global search (topbar typeahead, Elasticsearch-backed) ----

export function useGlobalSearch(q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => searchApi.global(query),
    // Only fire with something worth searching; the component debounces `q`.
    enabled: query.length >= 2,
    // Typing back and forth reuses the last few results instead of re-hitting ES.
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ---- Team / tenants / plans ----

export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: async () => teamsApi.list(),
  });
}

export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: () => tenantsApi.list(),
  });
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: async () => mockDelay<SubscriptionPlan[]>(mockPlans),
  });
}

// ---- Mutations (UI-only stubs) ----

/**
 * Generic stubbed mutation. Resolves after a short delay so buttons show a
 * pending state and success toasts fire. Swap `mutationFn` for the real call
 * and invalidate the relevant queryKey on success.
 */
function useStubMutation<TVars = unknown>(invalidate?: readonly unknown[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: TVars) => {
      // TODO(backend): perform the real POST/PUT/PATCH/DELETE here.
      return mockDelay(vars, 600);
    },
    onSuccess: () => {
      if (invalidate) qc.invalidateQueries({ queryKey: invalidate });
    },
  });
}

export const useCreateInvoice = () => useStubMutation(queryKeys.invoices);
export const useUpdateInvoice = () => useStubMutation(queryKeys.invoices);

/** Invalidate both the invoice list and the single invoice after a lifecycle action. */
function useInvoiceActionMutation(fn: (id: string) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fn(id),
    onSuccess: (_result, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export const useSendInvoice = () => useInvoiceActionMutation(invoicesApi.send);
export const useVoidInvoice = () => useInvoiceActionMutation(invoicesApi.voidInvoice);
export const useDuplicateInvoice = () =>
  useInvoiceActionMutation(invoicesApi.duplicate);
// LHDN MyInvois — submit the e-invoice. Real POST to the backend; invalidates
// both the list and the single invoice so its einvoiceStatus badge refreshes.
export function useSubmitEInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.submitEInvoice(id),
    onSuccess: (_updated, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.invoice(id) });
    },
  });
}
// TODO(backend): cancel not implemented server-side yet.
export const useCancelEInvoice = () => useStubMutation(queryKeys.invoices);
export const useCreateClient = () => useStubMutation(queryKeys.clients);
export const useUpdateClient = () => useStubMutation(queryKeys.clients);
export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: paymentsApi.ManualPaymentInput) =>
      paymentsApi.recordManual(payload),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.payments });
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.invoice(vars.invoiceId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    // RefundDialog passes { paymentId, amount, reason }; the backend refunds the
    // payment in full, so amount/reason are advisory only.
    mutationFn: (vars: { paymentId: string; amount?: string | number; reason?: string }) =>
      paymentsApi.refund(vars.paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payments });
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
export const useInviteMember = () => useStubMutation(queryKeys.team);
export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { uuid: string; status: TenantStatus }) =>
      tenantsApi.updateStatus(vars.uuid, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants }),
  });
}
