import { instance } from "./axios";

export interface UpdateOrganizationInput {
  organizationName: string;
  workspaceSubdomain: string;
  billingEmail: string;
  defaultCurrency: string;
  taxId?: string;
}

/** Update the organization profile (PUT /settings). */
export const updateOrganization = (uuid: string, payload: UpdateOrganizationInput) =>
  instance.patch(`/settings/${uuid}`, payload).then((r) => r.data);
