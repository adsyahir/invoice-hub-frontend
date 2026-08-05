import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

/**
 * Chrome for the post-registration setup steps. Not AppLayout — a sidebar here would
 * just invite the tenant to wander off mid-flow.
 */
export function OnboardingLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>
      <footer className="border-t bg-background">
        <div className="mx-auto flex h-12 w-full max-w-2xl items-center px-4 text-xs text-muted-foreground">
          © 2026 InvoiceHub. A Novosoft product.
        </div>
      </footer>
    </div>
  );
}
