import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Restores the session on app load.
 *
 * With both tokens in httpOnly cookies there is no token to put back anywhere — the only
 * question is whether the browser still holds a valid session, and /auth/me answers it. If the
 * access cookie has expired, the axios interceptor refreshes once and replays the call
 * transparently, so this reads as a single request.
 *
 * `bootstrapped` flips to true when this finishes, which is what RequireAuth waits on before
 * deciding to redirect to /login.
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
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
  }, [setUser, finishBootstrap]);
}
