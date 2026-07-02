/**
 * Mock data for the InvoiceHub UI.
 *
 * This is the ONLY place fixture data lives. The React Query hooks in
 * src/lib/api read from here so that, when wiring the backend, you only swap
 * the hook `queryFn` bodies — components never import this file directly.
 *
 * Context: Malaysian B2B SaaS. Currency MYR, 8% SST, INV-2026-#### numbering.
 * Dates are relative to mid-2026 to look current.
 */
import type {
  AgingBucket,
  AuditLog,
  Client,
  DashboardStats,
  Invoice,
  InvoiceLineItem,
  Payment,
  RevenuePoint,
  SubscriptionPlan,
  Tenant,
  User,
} from "@/types";

// ---------------------------------------------------------------------------
// Users (current tenant)
// ---------------------------------------------------------------------------

export const mockUsers: User[] = [
  {
    uuid: "u-1",
    keycloakId: "kc-1",
    email: "admin@novosoft.dev",
    fullName: "Adam Rahman",
    role: "TENANT_ADMIN",
    status: "ACTIVE",
    lastLoginAt: "2026-06-13T08:12:00Z",
    createdAt: "2025-11-02T09:00:00Z",
  },
  {
    uuid: "u-2",
    keycloakId: "kc-2",
    email: "sarah.lim@novosoft.dev",
    fullName: "Sarah Lim",
    role: "ACCOUNTANT",
    status: "ACTIVE",
    invitedBy: "u-1",
    lastLoginAt: "2026-06-12T16:40:00Z",
    createdAt: "2025-11-10T03:00:00Z",
  },
  {
    uuid: "u-3",
    keycloakId: "kc-3",
    email: "daniel.tan@novosoft.dev",
    fullName: "Daniel Tan",
    role: "ACCOUNTANT",
    status: "ACTIVE",
    invitedBy: "u-1",
    lastLoginAt: "2026-06-11T01:20:00Z",
    createdAt: "2026-01-15T02:00:00Z",
  },
  {
    uuid: "u-4",
    keycloakId: "kc-4",
    email: "priya.nair@novosoft.dev",
    fullName: "Priya Nair",
    role: "VIEWER",
    status: "ACTIVE",
    invitedBy: "u-2",
    lastLoginAt: "2026-06-09T07:05:00Z",
    createdAt: "2026-03-01T06:00:00Z",
  },
  {
    uuid: "u-5",
    keycloakId: "kc-5",
    email: "wei.chong@novosoft.dev",
    fullName: "Wei Chong",
    role: "ACCOUNTANT",
    status: "INVITED",
    invitedBy: "u-1",
    lastLoginAt: null,
    createdAt: "2026-06-10T10:00:00Z",
  },
];

export const currentUser: User = mockUsers[0];

export const currentTenant: Tenant = {
  uuid: "t-1",
  name: "Novosoft Sdn Bhd",
  slug: "novosoft",
  schemaName: "tenant_novosoft",
  plan: "PROFESSIONAL",
  status: "ACTIVE",
  maxUsers: 25,
  maxInvoicesPerMonth: 1000,
  userCount: 5,
  invoicesThisMonth: 38,
  createdAt: "2025-11-02T09:00:00Z",
  updatedAt: "2026-06-01T09:00:00Z",
};

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const mockClients: Client[] = [
  {
    id: "c-1",
    uuid: "c-uuid-1",
    name: "Maybank Digital Labs",
    email: "ap@maybank-labs.com.my",
    phone: "+60 3-2070 8833",
    addressLine1: "Menara Maybank, 100 Jalan Tun Perak",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C20100012345",
    currency: "MYR",
    paymentTermsDays:30,
    createdAt: "2025-11-12T02:00:00Z",
  },
  {
    id: "c-2",
    uuid: "c-uuid-2",
    name: "Grab Engineering",
    email: "vendor-payments@grab.com",
    phone: "+60 3-2630 0700",
    addressLine1: "Axiata Tower, 9 Jalan Stesen Sentral 5",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C20100098765",
    currency: "MYR",
    paymentTermsDays:45,
    createdAt: "2025-12-01T02:00:00Z",
  },
  {
    id: "c-3",
    uuid: "c-uuid-3",
    name: "Petronas Digital",
    email: "accounts@petronas.com.my",
    phone: "+60 3-2051 5000",
    addressLine1: "Tower 1, PETRONAS Twin Towers, KLCC",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C18800054321",
    currency: "MYR",
    paymentTermsDays:60,
    createdAt: "2026-01-08T02:00:00Z",
  },
  {
    id: "c-4",
    uuid: "c-uuid-4",
    name: "Carsome Group",
    email: "finance@carsome.my",
    phone: "+60 3-9213 0000",
    addressLine1: "Mercu 3, KL Eco City, Jalan Bangsar",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C20200011223",
    currency: "MYR",
    paymentTermsDays:30,
    createdAt: "2026-01-20T02:00:00Z",
  },
  {
    id: "c-5",
    uuid: "c-uuid-5",
    name: "AirAsia Tech",
    email: "ap@airasia.com",
    phone: "+60 3-8660 4333",
    addressLine1: "RedQ, Jalan Pekeliling 5, KLIA",
    city: "Sepang",
    state: "Selangor",
    country: "Malaysia",
    taxId: "C19900033445",
    currency: "MYR",
    paymentTermsDays:30,
    createdAt: "2026-02-14T02:00:00Z",
  },
  {
    id: "c-6",
    uuid: "c-uuid-6",
    name: "StoreHub Sdn Bhd",
    email: "billing@storehub.com",
    phone: "+60 3-9212 6688",
    addressLine1: "Level 23, Mercu 2, KL Eco City",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C20300044556",
    currency: "MYR",
    paymentTermsDays:14,
    createdAt: "2026-03-02T02:00:00Z",
  },
  {
    id: "c-7",
    uuid: "c-uuid-7",
    name: "Setel Ventures",
    email: "payables@setel.com",
    phone: "+60 3-2715 5000",
    addressLine1: "Menara Dayabumi, Jalan Sultan Hishamuddin",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    country: "Malaysia",
    taxId: "C20400055667",
    currency: "MYR",
    paymentTermsDays:30,
    createdAt: "2026-03-22T02:00:00Z",
  },
  {
    id: "c-8",
    uuid: "c-uuid-8",
    name: "Aerodyne Group",
    email: "finance@aerodyne.group",
    phone: "+60 3-7610 0888",
    addressLine1: "Tower B, Plaza 33, Jalan Kemajuan",
    city: "Petaling Jaya",
    state: "Selangor",
    country: "Malaysia",
    taxId: "C20500066778",
    currency: "MYR",
    paymentTermsDays:45,
    createdAt: "2026-04-11T02:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Invoice builder (keeps line-item math consistent)
// ---------------------------------------------------------------------------

type LineSeed = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

function buildLineItems(seeds: LineSeed[]): InvoiceLineItem[] {
  return seeds.map((s, i) => {
    const base = s.quantity * s.unitPrice;
    const taxAmount = round2((base * s.taxRate) / 100);
    return {
      id: `li-${i + 1}-${Math.round(base)}`,
      description: s.description,
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      taxRate: s.taxRate,
      taxAmount,
      lineTotal: round2(base + taxAmount),
      sortOrder: i,
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

type InvoiceSeed = {
  id: string;
  number: string;
  clientId: string;
  status: Invoice["status"];
  issueDate: string;
  dueDate: string;
  lines: LineSeed[];
  amountPaid?: number;
  discount?: number;
  sentAt?: string | null;
  paidAt?: string | null;
  notes?: string;
};

function buildInvoice(seed: InvoiceSeed): Invoice {
  const lineItems = buildLineItems(seed.lines);
  const subtotal = round2(
    lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0),
  );
  const taxAmount = round2(lineItems.reduce((sum, li) => sum + li.taxAmount, 0));
  const discountAmount = seed.discount ?? 0;
  const totalAmount = round2(subtotal + taxAmount - discountAmount);
  const amountPaid = seed.amountPaid ?? (seed.status === "PAID" ? totalAmount : 0);
  const client = mockClients.find((c) => c.id === seed.clientId);

  return {
    id: seed.id,
    invoiceNumber: seed.number,
    clientId: seed.clientId,
    client,
    createdBy: "u-2",
    status: seed.status,
    currency: "MYR",
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    amountPaid,
    amountDue: round2(totalAmount - amountPaid),
    issueDate: seed.issueDate,
    dueDate: seed.dueDate,
    notes: seed.notes ?? "Thank you for your business. Payment via FPX or card.",
    internalNotes: "",
    paymentLinkToken:
      seed.status === "SENT" || seed.status === "PARTIALLY_PAID" || seed.status === "OVERDUE"
        ? `pl_${seed.id}_tok`
        : null,
    paymentLinkExpiresAt: null,
    sentAt: seed.sentAt ?? (seed.status === "DRAFT" ? null : `${seed.issueDate}T03:00:00Z`),
    paidAt: seed.paidAt ?? (seed.status === "PAID" ? `${seed.dueDate}T05:00:00Z` : null),
    lineItems,
    createdAt: `${seed.issueDate}T02:00:00Z`,
    updatedAt: `${seed.issueDate}T02:00:00Z`,
  };
}

export const mockInvoices: Invoice[] = [
  buildInvoice({
    id: "inv-1",
    number: "INV-2026-0042",
    clientId: "c-1",
    status: "PAID",
    issueDate: "2026-05-02",
    dueDate: "2026-06-01",
    lines: [
      { description: "Mobile banking app — Sprint 14 development", quantity: 1, unitPrice: 48000, taxRate: 8 },
      { description: "UX research & usability testing", quantity: 12, unitPrice: 850, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-2",
    number: "INV-2026-0043",
    clientId: "c-2",
    status: "PARTIALLY_PAID",
    issueDate: "2026-05-15",
    dueDate: "2026-06-29",
    amountPaid: 20000,
    lines: [
      { description: "Platform engineering retainer — May 2026", quantity: 1, unitPrice: 36000, taxRate: 8 },
      { description: "Kafka pipeline optimisation", quantity: 40, unitPrice: 420, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-3",
    number: "INV-2026-0044",
    clientId: "c-3",
    status: "OVERDUE",
    issueDate: "2026-04-10",
    dueDate: "2026-05-10",
    lines: [
      { description: "Data lake migration — Phase 2", quantity: 1, unitPrice: 92000, taxRate: 8 },
      { description: "On-site workshop (3 days)", quantity: 3, unitPrice: 4500, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-4",
    number: "INV-2026-0045",
    clientId: "c-4",
    status: "SENT",
    issueDate: "2026-06-01",
    dueDate: "2026-07-01",
    lines: [
      { description: "Inventory pricing engine — monthly licence", quantity: 1, unitPrice: 15000, taxRate: 8 },
      { description: "Premium support add-on", quantity: 1, unitPrice: 2500, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-5",
    number: "INV-2026-0046",
    clientId: "c-5",
    status: "SENT",
    issueDate: "2026-06-05",
    dueDate: "2026-07-05",
    lines: [
      { description: "Flight ops dashboard — design system build", quantity: 1, unitPrice: 28000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-6",
    number: "INV-2026-0047",
    clientId: "c-6",
    status: "DRAFT",
    issueDate: "2026-06-12",
    dueDate: "2026-06-26",
    lines: [
      { description: "POS analytics module — discovery", quantity: 1, unitPrice: 9000, taxRate: 8 },
      { description: "Solution architecture document", quantity: 1, unitPrice: 3500, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-7",
    number: "INV-2026-0048",
    clientId: "c-7",
    status: "PAID",
    issueDate: "2026-05-20",
    dueDate: "2026-06-19",
    lines: [
      { description: "Loyalty service integration", quantity: 1, unitPrice: 18500, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-8",
    number: "INV-2026-0049",
    clientId: "c-8",
    status: "OVERDUE",
    issueDate: "2026-04-25",
    dueDate: "2026-05-25",
    amountPaid: 0,
    lines: [
      { description: "Drone fleet telemetry API", quantity: 1, unitPrice: 41000, taxRate: 8 },
      { description: "SLA monitoring setup", quantity: 1, unitPrice: 6000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-9",
    number: "INV-2026-0050",
    clientId: "c-1",
    status: "SENT",
    issueDate: "2026-06-08",
    dueDate: "2026-07-08",
    lines: [
      { description: "Fraud detection model — quarterly retrain", quantity: 1, unitPrice: 33000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-10",
    number: "INV-2026-0051",
    clientId: "c-2",
    status: "PARTIALLY_PAID",
    issueDate: "2026-05-28",
    dueDate: "2026-07-12",
    amountPaid: 15000,
    lines: [
      { description: "Driver app performance audit", quantity: 1, unitPrice: 22000, taxRate: 8 },
      { description: "Load testing (Gatling)", quantity: 1, unitPrice: 7500, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-11",
    number: "INV-2026-0052",
    clientId: "c-4",
    status: "VOID",
    issueDate: "2026-05-09",
    dueDate: "2026-06-08",
    lines: [
      { description: "Duplicate of INV-2026-0045 (issued in error)", quantity: 1, unitPrice: 15000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-12",
    number: "INV-2026-0053",
    clientId: "c-3",
    status: "REFUNDED",
    issueDate: "2026-03-15",
    dueDate: "2026-05-14",
    amountPaid: 0,
    paidAt: "2026-04-02T05:00:00Z",
    lines: [
      { description: "Proof-of-concept — cancelled engagement", quantity: 1, unitPrice: 12000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-13",
    number: "INV-2026-0054",
    clientId: "c-5",
    status: "DRAFT",
    issueDate: "2026-06-13",
    dueDate: "2026-07-13",
    lines: [
      { description: "Crew scheduling optimiser — scoping", quantity: 1, unitPrice: 11000, taxRate: 8 },
    ],
  }),
  buildInvoice({
    id: "inv-14",
    number: "INV-2026-0055",
    clientId: "c-7",
    status: "PAID",
    issueDate: "2026-05-30",
    dueDate: "2026-06-29",
    lines: [
      { description: "Payment gateway hardening", quantity: 1, unitPrice: 26500, taxRate: 8 },
      { description: "PCI compliance review", quantity: 1, unitPrice: 8000, taxRate: 8 },
    ],
  }),
];

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    invoiceNumber: "INV-2026-0042",
    clientName: "Maybank Digital Labs",
    amount: 62640,
    currency: "MYR",
    method: "BANK_TRANSFER",
    status: "COMPLETED",
    gateway: "MANUAL",
    gatewayTxnId: "MBB-TT-99821",
    recordedBy: "u-2",
    paidAt: "2026-05-30T05:00:00Z",
    createdAt: "2026-05-30T05:02:00Z",
  },
  {
    id: "pay-2",
    invoiceId: "inv-2",
    invoiceNumber: "INV-2026-0043",
    clientName: "Grab Engineering",
    amount: 20000,
    currency: "MYR",
    method: "FPX",
    status: "COMPLETED",
    gateway: "BILLPLZ",
    gatewayTxnId: "fpx_8f31aa",
    recordedBy: null,
    paidAt: "2026-05-22T09:14:00Z",
    createdAt: "2026-05-22T09:14:00Z",
  },
  {
    id: "pay-3",
    invoiceId: "inv-7",
    invoiceNumber: "INV-2026-0048",
    clientName: "Setel Ventures",
    amount: 19980,
    currency: "MYR",
    method: "CARD",
    status: "COMPLETED",
    gateway: "STRIPE",
    gatewayTxnId: "ch_3PqX2a",
    recordedBy: null,
    paidAt: "2026-06-02T11:30:00Z",
    createdAt: "2026-06-02T11:30:00Z",
  },
  {
    id: "pay-4",
    invoiceId: "inv-10",
    invoiceNumber: "INV-2026-0051",
    clientName: "Grab Engineering",
    amount: 15000,
    currency: "MYR",
    method: "FPX",
    status: "COMPLETED",
    gateway: "BILLPLZ",
    gatewayTxnId: "fpx_a12b9c",
    recordedBy: null,
    paidAt: "2026-06-04T02:45:00Z",
    createdAt: "2026-06-04T02:45:00Z",
  },
  {
    id: "pay-5",
    invoiceId: "inv-14",
    invoiceNumber: "INV-2026-0055",
    clientName: "Setel Ventures",
    amount: 37260,
    currency: "MYR",
    method: "CARD",
    status: "COMPLETED",
    gateway: "STRIPE",
    gatewayTxnId: "ch_3PrL9z",
    recordedBy: null,
    paidAt: "2026-06-10T07:20:00Z",
    createdAt: "2026-06-10T07:20:00Z",
  },
  {
    id: "pay-6",
    invoiceId: "inv-12",
    invoiceNumber: "INV-2026-0053",
    clientName: "Petronas Digital",
    amount: 12960,
    currency: "MYR",
    method: "CARD",
    status: "REFUNDED",
    gateway: "STRIPE",
    gatewayTxnId: "ch_3Pm0Qd",
    recordedBy: null,
    paidAt: "2026-04-02T05:00:00Z",
    createdAt: "2026-04-02T05:00:00Z",
  },
  {
    id: "pay-7",
    invoiceId: "inv-9",
    invoiceNumber: "INV-2026-0050",
    clientName: "Maybank Digital Labs",
    amount: 35640,
    currency: "MYR",
    method: "CARD",
    status: "FAILED",
    gateway: "STRIPE",
    gatewayTxnId: "ch_3Ps77f",
    recordedBy: null,
    paidAt: "2026-06-11T13:05:00Z",
    createdAt: "2026-06-11T13:05:00Z",
  },
];

// ---------------------------------------------------------------------------
// Audit log entries (keyed loosely by invoice in the api layer)
// ---------------------------------------------------------------------------

export function auditLogForInvoice(invoice: Invoice): AuditLog[] {
  const logs: AuditLog[] = [
    {
      id: `al-${invoice.id}-1`,
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "CREATED",
      performedBy: "u-2",
      performedByName: "Sarah Lim",
      createdAt: invoice.createdAt,
      ipAddress: "203.82.45.12",
    },
  ];
  if (invoice.sentAt) {
    logs.push({
      id: `al-${invoice.id}-2`,
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "SENT",
      performedBy: "u-2",
      performedByName: "Sarah Lim",
      createdAt: invoice.sentAt,
      ipAddress: "203.82.45.12",
    });
  }
  if (invoice.amountPaid > 0) {
    logs.push({
      id: `al-${invoice.id}-3`,
      entityType: "PAYMENT",
      entityId: invoice.id,
      action: "PAYMENT_RECORDED",
      performedBy: null,
      performedByName: "System",
      newValue: { amount: invoice.amountPaid },
      createdAt: invoice.paidAt ?? invoice.updatedAt,
    });
  }
  if (invoice.status === "VOID") {
    logs.push({
      id: `al-${invoice.id}-4`,
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "VOIDED",
      performedBy: "u-1",
      performedByName: "Adam Rahman",
      createdAt: invoice.updatedAt,
    });
  }
  return logs.reverse();
}

// ---------------------------------------------------------------------------
// Dashboard + reports aggregates
// ---------------------------------------------------------------------------

export const mockDashboardStats: DashboardStats = {
  totalInvoiced: 486500,
  totalPaid: 312400,
  totalOverdue: 98220,
  outstanding: 174100,
  currency: "MYR",
  invoiceCount: 38,
  paidCount: 21,
  overdueCount: 4,
  invoicedChange: 12.4,
  paidChange: 8.1,
};

export const mockRevenueSeries: RevenuePoint[] = [
  { month: "Jan", invoiced: 210000, paid: 188000 },
  { month: "Feb", invoiced: 245000, paid: 201000 },
  { month: "Mar", invoiced: 268000, paid: 233000 },
  { month: "Apr", invoiced: 312000, paid: 240000 },
  { month: "May", invoiced: 398000, paid: 305000 },
  { month: "Jun", invoiced: 486500, paid: 312400 },
];

export const mockAgingBuckets: AgingBucket[] = [
  { bucket: "Current", amount: 121400, count: 9 },
  { bucket: "1-30 days", amount: 52600, count: 3 },
  { bucket: "31-60 days", amount: 45620, count: 2 },
  { bucket: "61-90 days", amount: 18200, count: 1 },
  { bucket: "90+ days", amount: 0, count: 0 },
];

// ---------------------------------------------------------------------------
// Subscription plans (billing)
// ---------------------------------------------------------------------------

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "plan-free",
    name: "FREE",
    priceMonthly: 0,
    maxUsers: 3,
    maxInvoicesPerMonth: 10,
    features: ["Up to 10 invoices/mo", "3 team members", "Email support"],
  },
  {
    id: "plan-starter",
    name: "STARTER",
    priceMonthly: 49,
    maxUsers: 5,
    maxInvoicesPerMonth: 100,
    features: ["100 invoices/mo", "5 team members", "Payment links", "CSV export"],
  },
  {
    id: "plan-pro",
    name: "PROFESSIONAL",
    priceMonthly: 149,
    maxUsers: 25,
    maxInvoicesPerMonth: 1000,
    features: [
      "1,000 invoices/mo",
      "25 team members",
      "Recurring invoices",
      "Aging reports",
      "Priority support",
    ],
  },
  {
    id: "plan-ent",
    name: "ENTERPRISE",
    priceMonthly: 499,
    maxUsers: 999,
    maxInvoicesPerMonth: 100000,
    features: [
      "Unlimited invoices",
      "Unlimited members",
      "SSO / SAML",
      "Dedicated success manager",
      "Custom SLA",
    ],
  },
];

// ---------------------------------------------------------------------------
// Tenants (super-admin view)
// ---------------------------------------------------------------------------

export const mockTenants: Tenant[] = [
  currentTenant,
  {
    uuid: "t-2",
    name: "Kuali Ventures",
    slug: "kuali",
    schemaName: "tenant_kuali",
    plan: "STARTER",
    status: "ACTIVE",
    maxUsers: 5,
    maxInvoicesPerMonth: 100,
    userCount: 4,
    invoicesThisMonth: 22,
    createdAt: "2026-01-18T02:00:00Z",
    updatedAt: "2026-06-05T02:00:00Z",
  },
  {
    uuid: "t-3",
    name: "Lapasar Trading",
    slug: "lapasar",
    schemaName: "tenant_lapasar",
    plan: "PROFESSIONAL",
    status: "ACTIVE",
    maxUsers: 25,
    maxInvoicesPerMonth: 1000,
    userCount: 12,
    invoicesThisMonth: 140,
    createdAt: "2025-12-09T02:00:00Z",
    updatedAt: "2026-06-11T02:00:00Z",
  },
  {
    uuid: "t-4",
    name: "Pandai Education",
    slug: "pandai",
    schemaName: "tenant_pandai",
    plan: "ENTERPRISE",
    status: "ACTIVE",
    maxUsers: 999,
    maxInvoicesPerMonth: 100000,
    userCount: 48,
    invoicesThisMonth: 612,
    createdAt: "2025-09-22T02:00:00Z",
    updatedAt: "2026-06-12T02:00:00Z",
  },
  {
    uuid: "t-5",
    name: "Tukang Tech",
    slug: "tukang",
    schemaName: "tenant_tukang",
    plan: "FREE",
    status: "SUSPENDED",
    maxUsers: 3,
    maxInvoicesPerMonth: 10,
    userCount: 2,
    invoicesThisMonth: 0,
    createdAt: "2026-03-30T02:00:00Z",
    updatedAt: "2026-05-28T02:00:00Z",
  },
  {
    uuid: "t-6",
    name: "Senang Pay Solutions",
    slug: "senang",
    schemaName: "tenant_senang",
    plan: "STARTER",
    status: "CANCELLED",
    maxUsers: 5,
    maxInvoicesPerMonth: 100,
    userCount: 0,
    invoicesThisMonth: 0,
    createdAt: "2025-10-15T02:00:00Z",
    updatedAt: "2026-04-01T02:00:00Z",
  },
];
