import { instance } from "./axios";
import type { ApiResponse } from "./types";
import type { Tenant, User } from "@/types";

/** Shape returned by login / register / accept-invite. Adjust to your backend. */
export interface AuthResponse {
  user: User;
  token: string;
  tenant?: Tenant;
  permissions: string[];
}

export interface RegisterInput {
  orgName: string;
  slug: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AcceptInviteInput {
  token?: string;
  fullName: string;
  password: string;
}

export interface MeResponse {
  user: User;
  tenant?: Tenant;
  permissions: string[];
}

/** POST /api/auth/login — authenticates by email, returns the same shape as register. */
export const login = (email: string, password: string): Promise<AuthResponse> =>
  instance
    .post<AuthApiResponse>("/auth/login", { email, password })
    .then((r) => ({
      user: mapUser(r.data.user),
      tenant: r.data.tenant ? mapTenant(r.data.tenant) : undefined,
      token: r.data.token ?? "",
      permissions: r.data.permissions ?? [],
    }));

/** Current authenticated user, tenant + permissions; restores the session on load. */
export const me = (): Promise<MeResponse> =>
  instance.get<AuthApiResponse>("/auth/me").then((r) => ({
    user: mapUser(r.data.user),
    tenant: r.data.tenant ? mapTenant(r.data.tenant) : undefined,
    permissions: r.data.permissions ?? [],
  }));

/**
 * Raw shapes the Spring backend returns (flat body, numeric ids, partial user).
 * We map these into the richer frontend `User`/`Tenant` contracts below.
 */
interface BackendUser {
  id: number;
  fullName: string;
  email: string;
  role: User["role"];
}
interface BackendTenant {
  uuid: string;
  name: string;
  slug: string;
  plan: Tenant["plan"];
  status: Tenant["status"];
}
/** Flat body returned by /auth/login, /auth/register and /auth/me. */
interface AuthApiResponse {
  message?: string;
  token?: string;
  user: BackendUser;
  tenant?: BackendTenant;
  permissions?: string[];
}

const mapUser = (u: BackendUser): User => ({
  id: String(u.id),
  keycloakId: "",
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
});

const mapTenant = (t: BackendTenant): Tenant => ({
  uuid: t.uuid,
  name: t.name,
  slug: t.slug,
  schemaName: t.slug,
  plan: t.plan,
  status: t.status,
  maxUsers: 0,
  maxInvoicesPerMonth: 0,
  userCount: 1,
  invoicesThisMonth: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/** POST /api/auth/register — provisions the tenant + admin and signs them in. */
export const register = (payload: RegisterInput): Promise<AuthResponse> =>
  instance
    .post<AuthApiResponse>("/auth/register", payload)
    .then((r) => ({
      user: mapUser(r.data.user),
      tenant: r.data.tenant ? mapTenant(r.data.tenant) : undefined,
      token: r.data.token ?? "",
      permissions: r.data.permissions ?? [],
    }));

export const acceptInvite = (payload: AcceptInviteInput) =>
  instance
    .post<ApiResponse<AuthResponse>>("/auth/accept-invite", payload)
    .then((r) => r.data.data);

export const forgotPassword = (email: string) =>
  instance
    .post<ApiResponse<void>>("/auth/forgot-password", { email })
    .then((r) => r.data.data);

export const resetPassword = (token: string, password: string) =>
  instance
    .post<ApiResponse<void>>("/auth/reset-password", { token, password })
    .then((r) => r.data.data);

// Single-flight: concurrent callers (StrictMode's double-invoked effect, or
// several 401s at once) share one in-flight /auth/refresh instead of each firing
// its own duplicate request.
let inFlightRefresh: Promise<{ token: string }> | null = null;

export const refresh = (): Promise<{ token: string }> => {
  if (!inFlightRefresh) {
    inFlightRefresh = instance
      .post<{ token: string }>("/auth/refresh")
      .then((r) => r.data)
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
};

export const logout = () =>
  instance.post<ApiResponse<void>>("/auth/logout").then((r) => r.data.data);
