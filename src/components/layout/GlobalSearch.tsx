import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGlobalSearch } from "@/lib/api/services/queries";
import { formatCurrency } from "@/lib/format";
import { invoiceStatusStyle } from "@/lib/status";
import type { CurrencyCode } from "@/types";

/**
 * Topbar typeahead, backed by GET /api/search (Elasticsearch).
 *
 * The input value is debounced 300ms before it reaches the query hook — one request
 * per pause, not per keystroke. Results drop down in two permission-gated sections
 * (invoices / clients); clicking a hit navigates to its detail page.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useGlobalSearch(debounced);

  // Close when clicking anywhere outside the search box / dropdown.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const showResults = open && debounced.trim().length >= 2;
  const invoices = data?.invoices ?? [];
  const clients = data?.clients ?? [];
  const empty = !isFetching && invoices.length === 0 && clients.length === 0;

  function go(path: string) {
    setOpen(false);
    setQ("");
    navigate(path);
  }

  return (
    <div ref={rootRef} className="relative hidden w-full max-w-xs sm:block">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search invoices, clients…"
        className="h-8 pl-8"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {isFetching && showResults && (
        <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {empty ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{debounced.trim()}”
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {invoices.length > 0 && (
                <section>
                  <h4 className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                    <FileText className="size-3" />
                    Invoices
                  </h4>
                  {invoices.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => go(`/invoices/${hit.id}`)}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {hit.invoiceNumber}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {hit.clientName}
                        </span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatCurrency(
                          hit.totalAmount,
                          hit.currency as CurrencyCode,
                        )}
                      </span>
                      <Badge
                        variant="secondary"
                        className={invoiceStatusStyle[hit.status]?.className}
                      >
                        {invoiceStatusStyle[hit.status]?.label ?? hit.status}
                      </Badge>
                    </button>
                  ))}
                </section>
              )}

              {clients.length > 0 && (
                <section>
                  <h4 className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                    <Users className="size-3" />
                    Clients
                  </h4>
                  {clients.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => go(`/clients/${hit.id}`)}
                    >
                      <span className="truncate font-medium">{hit.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {hit.email}
                      </span>
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
