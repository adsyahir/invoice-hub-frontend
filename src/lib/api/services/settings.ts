import { instance } from "./axios";

export interface UpdateOrganizationInput {
  organizationName: string;
  workspaceSubdomain: string;
  billingEmail: string;
  defaultCurrency: string;
  taxId?: string;
}

export interface Organization {
  uuid: string;
  name: string;
  slug: string;
  plan: string;
  billingEmail?: string | null;
  defaultCurrency: string;
  taxId?: string | null;
  maxUsers: number;
  maxInvoicesPerMonth: number;
}

/** The caller's own organization profile. No id — the server uses your tenant. */
export const getOrganization = () =>
  instance.get<Organization>("/settings").then((r) => r.data);

/** Update the organization profile. */
export const updateOrganization = (uuid: string, payload: UpdateOrganizationInput) =>
  instance.patch(`/settings/${uuid}`, payload).then((r) => r.data);

// --- MyInvois e-invoicing settings ---------------------------------------

export type EinvoiceEnvironment = "SANDBOX" | "PRODUCTION";
export type EinvoiceStatus = "NOT_CONNECTED" | "CONNECTED" | "ERROR";

export interface EinvoiceSettings {
  environment: EinvoiceEnvironment;
  tin?: string | null;
  brn?: string | null;
  sstNumber?: string | null;
  status: EinvoiceStatus;
  connected: boolean;
  lastVerifiedAt?: string | null;
  lastError?: string | null;
  // Whether InvoiceHub's own intermediary credentials are configured server-side.
  platformReady: boolean;
}

export interface UpdateEinvoiceInput {
  environment: EinvoiceEnvironment;
  tin?: string;
  brn?: string;
  sstNumber?: string;
}

export const getEinvoice = () =>
  instance.get<EinvoiceSettings>("/settings/einvoice").then((r) => r.data);

export const updateEinvoice = (payload: UpdateEinvoiceInput) =>
  instance.put<EinvoiceSettings>("/settings/einvoice", payload).then((r) => r.data);

/** Verify / connect to MyInvois (simulated until the real client lands). */
export const verifyEinvoice = () =>
  instance.post<EinvoiceSettings>("/settings/einvoice/verify").then((r) => r.data);

export const disconnectEinvoice = () =>
  instance.delete<EinvoiceSettings>("/settings/einvoice").then((r) => r.data);
