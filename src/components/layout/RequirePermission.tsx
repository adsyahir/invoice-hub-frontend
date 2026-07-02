import { Navigate, Outlet } from "react-router-dom";
import { useHasPermission } from "@/stores/auth-store";

/**
 * Guards routes that require specific permission(s), e.g.
 *   <RequirePermission allow="tenant:manage" />
 *   <RequirePermission allow={["invoice:write", "invoice:void"]} requireAll />
 *
 * Must be nested inside <RequireAuth /> so permissions are loaded by the time
 * this renders. Denied users are redirected (default: dashboard).
 */
export function RequirePermission({
  allow,
  requireAll = false,
  redirectTo = "/dashboard",
}: {
  allow: string | string[];
  requireAll?: boolean;
  redirectTo?: string;
}) {
  const allowed = useHasPermission(allow, requireAll);
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
