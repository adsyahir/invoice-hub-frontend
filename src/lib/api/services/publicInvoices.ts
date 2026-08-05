import { instance } from "./axios";
import type { PublicInvoice } from "@/types";

/**
 * Payer-facing endpoints. Unauthenticated — the token in the URL is the whole
 * capability, so these are the only calls that work without a session.
 */

/** GET /api/public/invoices/{token} — the minimal view a payer is allowed to see. */
export const get = (token: string) =>
  instance.get<PublicInvoice>(`/public/invoices/${token}`).then((r) => r.data);

/**
 * POST /api/public/invoices/{token}/checkout — mints a Stripe Checkout session and
 * returns its URL.
 *
 * Called when the payer clicks Pay, never on page load: sessions expire in 24h, so one
 * created up front would be dead by the time a slow payer got to it.
 */
export const createCheckout = (token: string) =>
  instance
    .post<{ url: string }>(`/public/invoices/${token}/checkout`)
    .then((r) => r.data.url);
