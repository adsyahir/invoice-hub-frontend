import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

/** Minimal chrome for public, unauthenticated pages (e.g. payment links). */
export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 text-xs text-muted-foreground">
          <span>Secured by InvoiceHub</span>
          <span>© 2026 Novosoft</span>
        </div>
      </footer>
    </div>
  );
}
