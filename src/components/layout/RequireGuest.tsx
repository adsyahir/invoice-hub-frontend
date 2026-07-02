import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Guest-only routes (login, register, password reset…). Once a session is
 * restored, authenticated users are sent away — to where they came from if
 * known, otherwise the dashboard.
 */
export function RequireGuest() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const location = useLocation();

  // Wait for the on-load session restore so we don't flash the login form.
  if (!bootstrapped) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    const to = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
