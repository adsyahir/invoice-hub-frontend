import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ShieldCheck, Zap, Building2 } from "lucide-react";

/** Two-column auth shell: form on the left, brand panel on the right. */
export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 InvoiceHub. A Novosoft product.
        </p>
      </div>

      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="text-sm font-medium opacity-80">
          Multi-tenant invoicing & payments
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Invoicing infrastructure for modern B2B teams.
          </h2>
          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex items-center gap-3">
              <Zap className="size-4 shrink-0 opacity-80" />
              Create, send and track invoices in seconds.
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4 shrink-0 opacity-80" />
              Secure payment links with FPX, card & e-wallet.
            </li>
            <li className="flex items-center gap-3">
              <Building2 className="size-4 shrink-0 opacity-80" />
              Per-tenant isolation, roles and audit trails.
            </li>
          </ul>
        </div>
        <div className="text-xs opacity-70">
          Trusted by finance teams across Malaysia.
        </div>
      </div>
    </div>
  );
}
