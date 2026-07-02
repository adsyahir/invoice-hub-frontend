import axios from "axios";

/**
 * Configured axios instance. Currently unused by the mock hooks, but ready for
 * you to wire up: set VITE_API_URL and call `apiClient.get(...)` inside the
 * `queryFn`s in this folder, replacing the mock returns.
 *
 * The request interceptor already attaches a bearer token from the auth store
 * persisted in localStorage — adjust to your real token source.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.BACKEND_URL ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // TODO(backend): replace with your real access token retrieval.
  const raw = localStorage.getItem("invoicehub-auth");
  if (raw) {
    try {
      const token = JSON.parse(raw)?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

/** Simulates network latency so loading/skeleton states are visible. */
export function mockDelay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
