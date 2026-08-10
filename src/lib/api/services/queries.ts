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
  InvoiceStatus,
  SubscriptionPlan,
  TenantStatus,
} from "@/types";
import * as clientsApi from "./clients";
import * as invoicesApi from "./invoices";
import type { UpdateInvoiceInput } from "./invoices";
import * as paymentsApi from "./payments";
import * as reportsApi from "./reports";
import * as notificationsApi from "./notifications";
import * as searchApi from "./search";
import * as tenantsApi from "./tenants";
import * as teamsApi from "./team";
import * as payoutsApi from "./payouts";
import * as settingsApi from "./settings";
import * as publicInvoicesApi from "./publicInvoices";

/** Fake latency for the hooks still on mock data. Delete with the last mock queryFn. */
function mockDelay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

import { mockPlans } from "@/lib/mock/data";

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
  payouts: ["payouts"] as const,
  organization: ["organization"] as const,
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

/**
 * Public, unauthenticated invoice lookup by payment-link token.
 *
 * No retry: the common failures here are "expired" and "no such token", and retrying a
 * 404 just delays the message the payer needs to see.
 */
export function usePublicInvoice(token: string | undefined) {
  return useQuery({
    queryKey: ["public-invoice", token],
    enabled: !!token,
    retry: false,
    queryFn: () => publicInvoicesApi.get(token!),
  });
}

/**
 * Hands the payer to Stripe Checkout.
 *
 * A full-page redirect for the same reason as onboarding — Checkout is a hosted flow that
 * can bounce through 3-D Secure or a bank's FPX page, and popups get blocked. The payment
 * is confirmed by webhook, not by the payer landing back on the success URL.
 */
export function useStartCheckout(token: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const url = await publicInvoicesApi.createCheckout(token!);
      window.location.href = url;
      return url;
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

// ---- Organization settings ----

/** The caller's own organization profile (Settings → Organization). */
export function useOrganization() {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: () => settingsApi.getOrganization(),
  });
}

// ---- Payouts (Stripe Connect onboarding) ----

/**
 * The tenant's Stripe Connect state. Polls while onboarding is unfinished — ENABLED is
 * driven by Stripe's webhook, not by anything this browser did — and stops once charges
 * are on.
 *
 * @param enabled pass false to skip the request entirely (e.g. non-admin users).
 */
export function usePayoutsAccount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payouts,
    queryFn: () => payoutsApi.get(),
    enabled,
    refetchInterval: (query) =>
      query.state.data && query.state.data.status !== "ENABLED" ? 3000 : false,
    // Onboarding finishes in another tab (Stripe's), so re-check on return to ours.
    refetchOnWindowFocus: true,
  });
}

/**
 * Mints an AccountLink and hands the browser to Stripe. A full-page redirect, not a
 * popup — onboarding can bounce through identity verification, and popups get blocked.
 */
export function useStartPayoutsOnboarding() {
  return useMutation({
    mutationFn: async () => {
      const url = await payoutsApi.createOnboardingLink({
        returnUrl: `${window.location.origin}/onboarding/payouts/return`,
        // Hit when the link expired unopened; that page mints a fresh one on arrival.
        refreshUrl: `${window.location.origin}/onboarding/payouts`,
      });
      window.location.href = url;
      // The redirect tears the page down, so the button just stays pending.
      return url;
    },
  });
}

/** One-time login link to the tenant's Stripe Express dashboard. */
export function useOpenPayoutsDashboard() {
  return useMutation({
    mutationFn: async () => {
      const url = await payoutsApi.createDashboardLink();
      window.location.href = url;
      return url;
    },
  });
}

// ---- Mutations (UI-only stubs) ----

/**
 * Edit a DRAFT invoice.
 *
 * The server rejects a non-draft edit, so a 409 here is expected behaviour rather than a bug —
 * the caller surfaces the message.
 */
export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInvoiceInput }) =>
      invoicesApi.update(id, payload),
    onSuccess: (_updated, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.invoice(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

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
/** Cancel a validated e-invoice with LHDN. Refused server-side past the 72-hour window. */
export function useCancelEInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      invoicesApi.cancelEInvoice(id, reason),
    onSuccess: (_updated, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices });
      qc.invalidateQueries({ queryKey: queryKeys.invoice(id) });
    },
  });
}
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
export function useUpdateTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { uuid: string; status: TenantStatus }) =>
      tenantsApi.updateStatus(vars.uuid, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tenants }),
  });
}
