import type {
  EInvoiceStatus,
  InvoiceStatus,
  PaymentStatus,
  TenantStatus,
} from "@/types";

interface StatusStyle {
  label: string;
  /** Subtle tinted badge classes — restrained, not rainbow. */
  className: string;
  /** A small dot color for inline status indicators. */
  dot: string;
}

const base = "border-transparent font-medium";

export const invoiceStatusStyle: Record<InvoiceStatus, StatusStyle> = {
  DRAFT: {
    label: "Draft",
    className: `${base} bg-muted text-muted-foreground`,
    dot: "bg-muted-foreground",
  },
  SENT: {
    label: "Sent",
    className: `${base} bg-blue-500/10 text-blue-700 dark:text-blue-300`,
    dot: "bg-blue-500",
  },
  PARTIALLY_PAID: {
    label: "Partially paid",
    className: `${base} bg-amber-500/10 text-amber-700 dark:text-amber-300`,
    dot: "bg-amber-500",
  },
  PAID: {
    label: "Paid",
    className: `${base} bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`,
    dot: "bg-emerald-500",
  },
  OVERDUE: {
    label: "Overdue",
    className: `${base} bg-red-500/10 text-red-700 dark:text-red-300`,
    dot: "bg-red-500",
  },
  VOID: {
    label: "Void",
    className: `${base} bg-muted text-muted-foreground line-through`,
    dot: "bg-muted-foreground",
  },
  REFUNDED: {
    label: "Refunded",
    className: `${base} bg-violet-500/10 text-violet-700 dark:text-violet-300`,
    dot: "bg-violet-500",
  },
};

/** LHDN MyInvois e-invoice status — restrained tints, matches the invoice badges. */
export const einvoiceStatusStyle: Record<EInvoiceStatus, StatusStyle> = {
  NOT_SUBMITTED: {
    label: "Not submitted",
    className: `${base} bg-muted text-muted-foreground`,
    dot: "bg-muted-foreground",
  },
  PENDING: {
    label: "Pending LHDN",
    className: `${base} bg-amber-500/10 text-amber-700 dark:text-amber-300`,
    dot: "bg-amber-500",
  },
  VALIDATED: {
    label: "Validated",
    className: `${base} bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`,
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    className: `${base} bg-red-500/10 text-red-700 dark:text-red-300`,
    dot: "bg-red-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: `${base} bg-muted text-muted-foreground line-through`,
    dot: "bg-muted-foreground",
  },
};

export const paymentStatusStyle: Record<PaymentStatus, StatusStyle> = {
  PENDING: {
    label: "Pending",
    className: `${base} bg-amber-500/10 text-amber-700 dark:text-amber-300`,
    dot: "bg-amber-500",
  },
  COMPLETED: {
    label: "Completed",
    className: `${base} bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`,
    dot: "bg-emerald-500",
  },
  FAILED: {
    label: "Failed",
    className: `${base} bg-red-500/10 text-red-700 dark:text-red-300`,
    dot: "bg-red-500",
  },
  REFUNDED: {
    label: "Refunded",
    className: `${base} bg-violet-500/10 text-violet-700 dark:text-violet-300`,
    dot: "bg-violet-500",
  },
};

export const tenantStatusStyle: Record<TenantStatus, StatusStyle> = {
  ACTIVE: {
    label: "Active",
    className: `${base} bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`,
    dot: "bg-emerald-500",
  },
  SUSPENDED: {
    label: "Suspended",
    className: `${base} bg-amber-500/10 text-amber-700 dark:text-amber-300`,
    dot: "bg-amber-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: `${base} bg-muted text-muted-foreground`,
    dot: "bg-muted-foreground",
  },
};

export const paymentMethodLabel: Record<string, string> = {
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  FPX: "FPX",
  EWALLET: "E-wallet",
};
