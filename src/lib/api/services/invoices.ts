import { instance } from "./axios";
import type { ApiResponse } from "./types";
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
    .get<ApiResponse<Invoice[]>>("/invoices", { params })
    .then((r) => r.data.data);

// Fetch one invoice by its public uuid (backend GET /invoices/{uuid}).
export const get = (uuid: string) =>
  instance.get<ApiResponse<Invoice>>(`/invoices/${uuid}`).then((r) => r.data.data);

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
//     .put<ApiResponse<Invoice>>(`/invoices/${id}`, payload)
//     .then((r) => r.data.data);

// export const send = (id: string) =>
//   instance.post<ApiResponse<Invoice>>(`/invoices/${id}/send`).then((r) => r.data.data);

// export const voidInvoice = (id: string) =>
//   instance.post<ApiResponse<Invoice>>(`/invoices/${id}/void`).then((r) => r.data.data);

// export const duplicate = (id: string) =>
//   instance
//     .post<ApiResponse<Invoice>>(`/invoices/${id}/duplicate`)
//     .then((r) => r.data.data);

// export const getAuditLog = (id: string) =>
//   instance
//     .get<ApiResponse<AuditLog[]>>(`/invoices/${id}/audit-log`)
//     .then((r) => r.data.data);

// export const getPayments = (id: string) =>
//   instance
//     .get<ApiResponse<Payment[]>>(`/invoices/${id}/payments`)
//     .then((r) => r.data.data);

// /** Returns the PDF as a Blob for download. */
// export const getPdf = (id: string) =>
//   instance
//     .get(`/invoices/${id}/pdf`, { responseType: "blob" })
//     .then((r) => r.data as Blob);
