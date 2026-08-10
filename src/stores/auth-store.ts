import { create } from "zustand";
import type { Tenant, User, UserRole } from "@/types";

/**
 * Session state — who is signed in, not how they prove it.
 *
 * There is deliberately no token here. Both auth tokens live in httpOnly cookies the browser
 * manages; the app only ever knows *that* it is authenticated, never the credential. That is
 * what stops an XSS payload from reading a token out of the store and replaying it elsewhere.
 */
interface AuthState {
  isAuthenticated: boolean;
  /** False until the on-load session restore has finished. */
  bootstrapped: boolean;
  user: User | null;
  /**
   * The user's real role from the backend, unaffected by the demo role
   * switcher. `user.role` is the *previewed* role; gate admin-only affordances
   * (like the switcher itself) on this so previewing can't lock you out.
   */
  actualRole: UserRole | null;
  tenant: Tenant | null;
  /** Effective permissions for the current user (e.g. "invoice:write"). */
  permissions: string[];
  setUser: (user: User, tenant?: Tenant, permissions?: string[]) => void;
  finishBootstrap: () => void;
  login: (user: User, tenant?: Tenant, permissions?: string[]) => void;
  logout: () => void;
  /** Drops the local session after the server rejected it (expired/revoked cookie). */
  clearSession: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  bootstrapped: false,
  user: null,
  actualRole: null,
  tenant: null,
  permissions: [],

  setUser: (user, tenant, permissions) =>
    set({
      isAuthenticated: true,
      user,
      actualRole: user.role,
      tenant: tenant ?? null,
      permissions: permissions ?? [],
    }),

  finishBootstrap: () => set({ bootstrapped: true }),

  login: (user, tenant, permissions) =>
    set({
      isAuthenticated: true,
      user,
      actualRole: user.role,
      tenant: tenant ?? null,
      permissions: permissions ?? [],
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      actualRole: null,
      tenant: null,
      permissions: [],
    }),

  clearSession: () =>
    set({
      isAuthenticated: false,
      user: null,
      actualRole: null,
      tenant: null,
      permissions: [],
    }),

  switchRole: (role) =>
    set((state) => (state.user ? { user: { ...state.user, role } } : state)),
}));

// ---------------------------------------------------------------------------
// Selector hooks — the read side of the auth "middleware".
// ---------------------------------------------------------------------------

/** True once a session is restored/authenticated. */
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

/** The current user's role, or undefined when signed out. */
export const useRole = () => useAuthStore((s) => s.user?.role);

/** The user's real role (ignores demo role-preview). */
export const useActualRole = () => useAuthStore((s) => s.actualRole);

/** Does the current user hold the given role? */
export const useHasRole = (...roles: UserRole[]) =>
  useAuthStore((s) => !!s.user && roles.includes(s.user.role));

/**
 * Permission check. By default passes if the user has ANY of the given
 * permissions; set `requireAll` to require all of them.
 */
export const useHasPermission = (
  permission: string | string[],
  requireAll = false,
) =>
  useAuthStore((s) => {
    const needed = Array.isArray(permission) ? permission : [permission];
    if (needed.length === 0) return true;
    const owned = new Set(s.permissions);
    return requireAll
      ? needed.every((p) => owned.has(p))
      : needed.some((p) => owned.has(p));
  });
