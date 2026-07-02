import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SelectField } from "@/components/common/SelectField";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { InvoiceStatusBadge } from "@/components/common/StatusBadge";
import { InvoiceRowActions } from "@/components/invoices/InvoiceRowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClients, useInvoices } from "@/lib/api/services/queries";
import { invoiceStatusFilterOptions } from "@/lib/options";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceStatus } from "@/types";

const PAGE_SIZE = 8;

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [clientId, setClientId] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const clients = useClients();
  const invoices = useInvoices({ search, status, clientId });
  console.log("Invoices data:", invoices.data); // Log the invoices data for debugging
  const clientOptions = useMemo(
    () => [
      { value: "ALL", label: "All clients" },
      ...(clients.data ?? []).map((c) => ({ value: c.uuid, label: c.name })),
    ],
    [clients.data],
  );

  const rows = invoices.data ?? [];
  const total = rows.length;
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create, send and track every invoice."
        actions={
          <Button render={<Link to="/invoices/new" />}>
            <Plus className="size-4" />
            New invoice
          </Button>
        }
      />

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder="Search by number or client…"
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <SelectField
              value={status}
              onValueChange={(v) => resetPage(setStatus)(v as InvoiceStatus | "ALL")}
              options={invoiceStatusFilterOptions}
              className="w-[150px]"
            />
            <SelectField
              value={clientId}
              onValueChange={resetPage(setClientId)}
              options={clientOptions}
              className="w-[160px]"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 p-0">
                  <EmptyState
                    icon={FileText}
                    title="No invoices found"
                    description="Try adjusting your filters, or create a new invoice."
                    className="border-0"
                    action={
                      <Button size="sm" render={<Link to="/invoices/new" />}>
                        New invoice
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paged.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <Link to={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client?.name}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.issueDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {inv.amountDue > 0 ? (
                      <span className="font-medium">
                        {formatCurrency(inv.amountDue, inv.currency)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <InvoiceRowActions invoice={inv} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {total > 0 && (
          <div className="border-t p-3">
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </>
  );
}
