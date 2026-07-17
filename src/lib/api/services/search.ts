import { instance } from "./axios";
import type { InvoiceStatus } from "@/types";

/** One invoice hit from GET /search — `id` is the public uuid for /invoices/:id. */
export interface SearchInvoiceHit {
  id: string;
  invoiceNumber: string;
  clientName: string;
  status: InvoiceStatus;
  currency: string;
  totalAmount: number;
}

/** One client hit — `id` is the public uuid for /clients/:id. */
export interface SearchClientHit {
  id: string;
  name: string;
  email: string;
}

export interface GlobalSearchResult {
  invoices: SearchInvoiceHit[];
  clients: SearchClientHit[];
}

/**
 * Topbar typeahead, backed by Elasticsearch. Sections the user lacks permission
 * for come back as empty arrays, so the UI never needs its own permission checks.
 */
export const global = (q: string) =>
  instance
    .get<GlobalSearchResult>("/search", { params: { q } })
    .then((r) => r.data);
