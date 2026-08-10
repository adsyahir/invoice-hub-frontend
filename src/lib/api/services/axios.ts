import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

/**
 * The single axios instance.
 *
 * No token handling anywhere in here on purpose. Both auth tokens live in httpOnly cookies
 * the browser attaches automatically and JavaScript cannot read, so there is nothing for an
 * XSS payload to steal and replay elsewhere.
 *
 * The cost of cookie auth is CSRF exposure, paid back by two things: SameSite=Strict on the
 * auth cookies, and the double-submit token below. Spring issues a readable XSRF-TOKEN cookie;
 * axios echoes it in X-XSRF-TOKEN. A cross-site attacker's page can cause the cookie to be
 * sent but cannot read it, so it cannot produce the header.
 */
const instance = axios.create({
  // Same-origin by default (the Vite dev proxy forwards /api → backend), which keeps the
  // auth cookies first-party. Set VITE_BACKEND_URL to call the backend directly.
  baseURL: (import.meta.env.VITE_BACKEND_URL ?? "") + "/api",
  timeout: 5000,
  withCredentials: true, // send the auth cookies
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  // Required by axios ≥1.6 to attach the CSRF header when withCredentials is set; without
  // it the header is silently dropped and every mutating request comes back 403.
  withXSRFToken: true,
});

/**
 * Shared in-flight refresh. When several requests 401 at once (the access cookie just
 * expired), they all await this single /auth/refresh instead of each firing their own —
 * which previously raced and could clear the session.
 *
 * Resolves to nothing: the new access token arrives as a Set-Cookie header, never as a value
 * this code could hold.
 */
let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = instance
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never try to refresh in response to the refresh call itself failing — that's what
    // caused the infinite /auth/refresh loop. Bail and clear.
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        // No header to rewrite — the browser sends the refreshed cookie on the replay.
        return instance(originalRequest);
      } catch (refreshError) {
        // Only a rejected session ends the session. A 403 on the refresh itself means the
        // CSRF token was missing or stale, which says nothing about whether the user is still
        // signed in — treating it as a dead session would sign them out spuriously.
        if (axios.isAxiosError(refreshError) && refreshError.response?.status !== 403) {
          useAuthStore.getState().clearSession();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { instance };
