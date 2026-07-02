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
  AgingBucket,
  AuditLog,
  Client,
  DashboardStats,
  Invoice,
  InvoiceStatus,
  Payment,
  RevenuePoint,
  SubscriptionPlan,
  Tenant,
} from "@/types";
import { mockDelay } from "./client";
import * as clientsApi from "./clients";
import * as invoicesApi from "./invoices";
import * as teamsApi from "./team";

import {
  auditLogForInvoice,
  mockAgingBuckets,
  mockDashboardStats,
  mockInvoices,
  mockPayments,
  mockPlans,
  mockRevenueSeries,
  mockTenants,
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
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoice(id ?? ""),
    enabled: !!id,
    queryFn: () => invoicesApi.get(id!),
  });
}

export function useInvoiceAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoiceAudit(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      // TODO(backend): GET /api/v1/invoices/{id}/audit-log
      const invoice = mockInvoices.find((i) => i.id === id);
      return mockDelay<AuditLog[]>(invoice ? auditLogForInvoice(invoice) : []);
    },
  });
}

export function useInvoicePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.payments, "invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () =>
      mockDelay<Payment[]>(
        mockPayments.filter((p) => p.invoiceId === invoiceId),
      ),
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
    // TODO(backend): GET /api/v1/payments
    queryFn: async () => mockDelay<Payment[]>([...mockPayments]),
  });
}

// ---- Dashboard / reports ----

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    // TODO(backend): GET /api/v1/reports/dashboard
    queryFn: async () => mockDelay<DashboardStats>(mockDashboardStats),
  });
}

export function useRevenueSeries() {
  return useQuery({
    queryKey: queryKeys.revenue,
    queryFn: async () => mockDelay<RevenuePoint[]>(mockRevenueSeries),
  });
}

export function useAgingReport() {
  return useQuery({
    queryKey: queryKeys.aging,
    // TODO(backend): GET /api/v1/reports/aging
    queryFn: async () => mockDelay<AgingBucket[]>(mockAgingBuckets),
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
    // TODO(backend): GET /api/v1/admin/tenants  (super-admin only)
    queryFn: async () => mockDelay<Tenant[]>([...mockTenants]),
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
export const useSendInvoice = () => useStubMutation(queryKeys.invoices);
export const useVoidInvoice = () => useStubMutation(queryKeys.invoices);
export const useDuplicateInvoice = () => useStubMutation(queryKeys.invoices);
export const useCreateClient = () => useStubMutation(queryKeys.clients);
export const useUpdateClient = () => useStubMutation(queryKeys.clients);
export const useRecordPayment = () => useStubMutation(queryKeys.payments);
export const useRefundPayment = () => useStubMutation(queryKeys.payments);
export const useInviteMember = () => useStubMutation(queryKeys.team);
export const useUpdateTenantStatus = () => useStubMutation(queryKeys.tenants);
