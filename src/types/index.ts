/**
 * Domain types for InvoiceHub.
 *
 * These mirror the database schema described in
 * InvoiceHub-ProjectDocumentation.md (section 3) and double as the API DTO
 * contracts. When wiring the backend, keep these in sync with the server
 * responses — the React Query hooks in src/lib/api return these shapes.
 */

// ---------------------------------------------------------------------------
// Enums (kept as string-literal unions to match the SQL ENUMs in the doc)
// ---------------------------------------------------------------------------

export type UserRole =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "ACCOUNTANT"
  | "VIEWER";

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type TenantPlan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "VOID"
  | "REFUNDED";

export type PaymentMethod =
  | "CARD"
  | "BANK_TRANSFER"
  | "CASH"
  | "FPX"
  | "EWALLET";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type CurrencyCode = "MYR" | "USD" | "SGD" | "EUR" | "GBP";

// ---------------------------------------------------------------------------
// Public schema (shared)
// ---------------------------------------------------------------------------

export interface Tenant {
  uuid: string;
  name: string;
  slug: string;
  schemaName: string;
  plan: TenantPlan;
  status: TenantStatus;
  maxUsers: number;
  maxInvoicesPerMonth: number;
  // Derived usage stats (super-admin view)
  userCount: number;
  invoicesThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: TenantPlan;
  priceMonthly: number;
  maxUsers: number;
  maxInvoicesPerMonth: number;
  features: string[];
}

// ---------------------------------------------------------------------------
// Tenant schema (per-tenant)
// ---------------------------------------------------------------------------

export interface User {
  uuid: string;
  keycloakId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  invitedBy?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface Client {
  id: string;      // internal bigint — used for row actions (delete)
  uuid: string;    // public handle — used in URLs (view/edit)
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  stateId?: number;
  state?: string;
  cityId?: number;
  city?: string;
  postcodeId?: number;
  postcode?: string;
  country?: string;
  taxId?: string;
  currency: CurrencyCode;
  paymentTermsDays: number;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percent, e.g. 8 for 8% SST
  taxAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client; // nested client object from the backend (InvoiceResponse)
  createdBy: string;
  createdByName?: string; // flattened from the backend (InvoiceResponse)
  status: InvoiceStatus;
  currency: CurrencyCode;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
  internalNotes?: string;
  paymentLinkToken?: string | null;
  paymentLinkExpiresAt?: string | null;
  sentAt?: string | null;
  paidAt?: string | null;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  clientName?: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway?: string; // STRIPE, BILLPLZ, MANUAL
  gatewayTxnId?: string | null;
  metadata?: Record<string, unknown>;
  recordedBy?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string; // INVOICE, PAYMENT, USER
  entityId: string;
  action: string; // CREATED, STATUS_CHANGED, SENT, ...
  performedBy?: string | null;
  performedByName?: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Aggregates used by the dashboard / reports screens
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalInvoiced: number;
  totalPaid: number;
  totalOverdue: number;
  outstanding: number;
  currency: CurrencyCode;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  // % change vs previous period
  invoicedChange: number;
  paidChange: number;
}

export interface RevenuePoint {
  month: string; // e.g. "Jan"
  invoiced: number;
  paid: number;
}

export interface AgingBucket {
  bucket: "Current" | "1-30 days" | "31-60 days" | "61-90 days" | "90+ days";
  amount: number;
  count: number;
}

// ---------------------------------------------------------------------------
// Generic envelope (matches the doc's standard response format, section 4.1)
// ---------------------------------------------------------------------------

export interface Paginated<T> {
  data: T[];
  meta: { page: number; size: number; total: number };
}
