import axios from "axios";
import { instance } from "./axios";
import type { PayoutsAccount } from "@/types";

/**
 * Stripe Connect onboarding for the signed-in tenant: read the status, send them to
 * Stripe's hosted KYC form, re-read when they come back.
 *
 * There is no "create account" call — the backend creates it during registration. The
 * re-read is eventually consistent: `account.updated` is what flips a tenant to ENABLED
 * and can land after the redirect, which is why the return page polls.
 */

/**
 * GET /api/payouts/account — current Stripe Connect state.
 *
 * `null` on 404 means this deployment has no payouts, so the UI drops the onboarding
 * step instead of stranding the tenant on a screen whose only button can't work.
 */
export const get = (): Promise<PayoutsAccount | null> =>
  instance
    .get<PayoutsAccount>("/payouts/account")
    .then((r) => r.data)
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    });

export interface OnboardingLinkInput {
  /** Where Stripe sends the tenant after they finish (or abandon) the form. */
  returnUrl: string;
  /** Where Stripe sends them if the link expired before they opened it. */
  refreshUrl: string;
}

/**
 * POST /api/payouts/onboarding-link — a fresh Stripe AccountLink. Single-use and
 * short-lived, so this is called every time and the URL is never cached.
 */
export const createOnboardingLink = (payload: OnboardingLinkInput) =>
  instance
    .post<{ url: string }>("/payouts/onboarding-link", payload)
    .then((r) => r.data.url);

/**
 * POST /api/payouts/dashboard-link — one-time login link to the tenant's Stripe Express
 * dashboard. Only valid once onboarding is complete.
 */
export const createDashboardLink = () =>
  instance
    .post<{ url: string }>("/payouts/dashboard-link")
    .then((r) => r.data.url);
