import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

const instance = axios.create({
  // Same-origin by default (the Vite dev proxy forwards /api → backend), which
  // keeps the refresh cookie first-party. Set VITE_BACKEND_URL to call the
  // backend directly (cross-origin) instead.
  baseURL: (import.meta.env.VITE_BACKEND_URL ?? "") + "/api",
  timeout: 5000,
  withCredentials: true, // send cookies (harmless when same-origin)
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared in-flight refresh. When several requests 401 at once (the access token
// just expired), they all await this single /auth/refresh instead of each firing
// their own — which previously raced and could clear the session.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = instance
      .post<{ token: string }>("/auth/refresh")
      .then((r) => {
        useAuthStore.getState().setToken(r.data.token);
        return r.data.token;
      })
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

    // Never try to refresh in response to the refresh call itself failing —
    // that's what caused the infinite /auth/refresh loop. Bail and clear.
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { instance };