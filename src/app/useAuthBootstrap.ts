import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Restores the session on app load (Option A).
 *
 * The access token lives only in memory, so on a fresh page load we ask the
 * server for a new one using the httpOnly refresh-token cookie (sent because
 * axios is configured with `withCredentials: true`). If that succeeds we then
 * fetch the current user via `/auth/me` and populate the store. If it fails
 * (no/expired cookie), we simply stay logged out.
 *
 * `bootstrapped` flips to true when this finishes so `RequireAuth` knows it can
 * stop showing the loader and safely decide whether to redirect to /login.
 */
export function useAuthBootstrap() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { token } = await api.auth.refresh();
        if (!active) return;
        setToken(token);

        const { user, tenant, permissions } = await api.auth.me();
        if (!active) return;
        setUser(user, tenant, permissions);
      } catch {
        // No valid session — stay logged out.
      } finally {
        if (active) finishBootstrap();
      }
    })();

    return () => {
      active = false;
    };
  }, [setToken, setUser, finishBootstrap]);
}
