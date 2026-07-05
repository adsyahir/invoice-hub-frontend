import { instance } from "./axios";
import type {
  CurrencyCode,
  Invoice,
  InvoiceStatus,
} from "@/types";

export interface InvoiceListParams {
  q?: string;
  status?: InvoiceStatus;
  clientId?: string;
  page?: number;
  size?: number;
}

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface InvoiceInput {
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode | string;
  notes?: string;
  internalNotes?: string;
  lineItems: InvoiceLineItemInput[];
}

export const list = (params?: InvoiceListParams) =>
  instance
    .get<Invoice[]>("/invoices", { params })
    .then((r) => r.data);

// Fetch one invoice by its public uuid (backend GET /invoices/{uuid}).
export const get = (uuid: string) =>
  instance.get<Invoice>(`/invoices/${uuid}`).then((r) => r.data);

/**
 * Backend POST /invoices/create returns a flat summary Map (NOT the ApiResponse
 * envelope), so we unwrap just r.data here. `id` is the invoice's public uuid.
 */
export interface CreateInvoiceResult {
  message: string;
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountDue: number;
}

export const create = (payload: InvoiceInput) =>
  instance
    .post<CreateInvoiceResult>("/invoices/create", payload)
    .then((r) => r.data);

// export const update = (id: string, payload: Partial<InvoiceInput>) =>
//   instance
//     .put<Invoice>(`/invoices/${id}`, payload)
//     .then((r) => r.data);

// export const send = (id: string) =>
//   instance.post<Invoice>(`/invoices/${id}/send`).then((r) => r.data);

// export const voidInvoice = (id: string) =>
//   instance.post<Invoice>(`/invoices/${id}/void`).then((r) => r.data);

// export const duplicate = (id: string) =>
//   instance
//     .post<Invoice>(`/invoices/${id}/duplicate`)
//     .then((r) => r.data);

// --- LHDN MyInvois e-invoicing (Malaysia) ---

/** Submit the invoice to LHDN MyInvois; returns the updated invoice. */
export const submitEInvoice = (id: string) =>
  instance
    .post<Invoice>(`/invoices/${id}/einvoice/submit`)
    .then((r) => r.data);

// TODO(backend): not implemented server-side yet.
// export const cancelEInvoice = (id: string, reason: string) =>
//   instance
//     .post<Invoice>(`/invoices/${id}/einvoice/cancel`, { reason })
//     .then((r) => r.data);
//
// /** Verify a buyer's TIN against LHDN before issuing an e-invoice. */
// export const verifyTin = (tin: string, brn?: string) =>
//   instance
//     .get<{ valid: boolean; name?: string }>("/einvoice/verify-tin", {
//       params: { tin, brn },
//     })
//     .then((r) => r.data);

// export const getAuditLog = (id: string) =>
//   instance
//     .get<AuditLog[]>(`/invoices/${id}/audit-log`)
//     .then((r) => r.data);

// export const getPayments = (id: string) =>
//   instance
//     .get<Payment[]>(`/invoices/${id}/payments`)
//     .then((r) => r.data);

// /** Returns the PDF as a Blob for download. */
// export const getPdf = (id: string) =>
//   instance
//     .get(`/invoices/${id}/pdf`, { responseType: "blob" })
//     .then((r) => r.data as Blob);
