import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

/** Guards routes that only certain roles may access. */
export function RequireRole({ allow }: { allow: UserRole[] }) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
