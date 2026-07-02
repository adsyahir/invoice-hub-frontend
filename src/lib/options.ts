import type { SelectOption } from "@/components/common/SelectField";
import { invoiceStatusStyle } from "@/lib/status";
import type { InvoiceStatus } from "@/types";

export const invoiceStatusOptions: SelectOption[] = (
  Object.keys(invoiceStatusStyle) as InvoiceStatus[]
).map((s) => ({ value: s, label: invoiceStatusStyle[s].label }));

export const invoiceStatusFilterOptions: SelectOption[] = [
  { value: "ALL", label: "All statuses" },
  ...invoiceStatusOptions,
];

export const currencyOptions: SelectOption[] = [
  { value: "MYR", label: "MYR — Malaysian Ringgit" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — Pound Sterling" },
];

export const paymentMethodOptions: SelectOption[] = [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CARD", label: "Card" },
  { value: "FPX", label: "FPX" },
  { value: "EWALLET", label: "E-wallet" },
  { value: "CASH", label: "Cash" },
];

export const paymentStatusFilterOptions: SelectOption[] = [
  { value: "ALL", label: "All statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export const paymentMethodFilterOptions: SelectOption[] = [
  { value: "ALL", label: "All methods" },
  ...paymentMethodOptions,
];

export const paymentTermsOptions: SelectOption[] = [
  { value: "0", label: "Due on receipt" },
  { value: "7", label: "Net 7" },
  { value: "14", label: "Net 14" },
  { value: "30", label: "Net 30" },
  { value: "45", label: "Net 45" },
  { value: "60", label: "Net 60" },
];

export const inviteRoleOptions: SelectOption[] = [
  { value: "TENANT_ADMIN", label: "Tenant Admin" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "VIEWER", label: "Viewer" },
];
