import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MoreHorizontal, Pencil, Search, Trash2, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { SelectField } from "@/components/common/SelectField";
import { Combobox } from "@/components/common/Combobox";
import { RecordPaymentDialog } from "@/components/payments/RecordPaymentDialog";
import { RefundDialog } from "@/components/payments/RefundDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import { usePayments } from "@/lib/api/services/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/status";
import { paymentMethodFilterOptions, paymentStatusFilterOptions } from "@/lib/options";
import type { Payment, PaymentMethod, PaymentStatus } from "@/types";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { data, isLoading } = usePayments();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [method, setMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [gateway, setGateway] = useState<string>("ALL");
  const [client, setClient] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [refundFor, setRefundFor] = useState<Payment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  // Distinct gateways / clients present in the data → filter dropdown options.
  const gatewayOptions = useMemo(() => {
    const set = new Set((data ?? []).map((p) => p.gateway).filter(Boolean) as string[]);
    return [{ value: "ALL", label: "All gateways" }, ...[...set].sort().map((g) => ({ value: g, label: g }))];
  }, [data]);

  const clientOptions = useMemo(() => {
    const set = new Set((data ?? []).map((p) => p.clientName).filter(Boolean) as string[]);
    return [{ value: "ALL", label: "All clients" }, ...[...set].sort().map((c) => ({ value: c, label: c }))];
  }, [data]);

  // Filter the payments client-side.
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter((p) => {
      const matchesSearch =
        !q ||
        p.invoiceNumber?.toLowerCase().includes(q) ||
        p.clientName?.toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || p.status === status;
      const matchesMethod = method === "ALL" || p.method === method;
      const matchesGateway = gateway === "ALL" || p.gateway === gateway;
      const matchesClient = client === "ALL" || p.clientName === client;
      const day = (p.paidAt ?? "").slice(0, 10); // YYYY-MM-DD
      const matchesFrom = !dateFrom || day >= dateFrom;
      const matchesTo = !dateTo || day <= dateTo;
      return (
        matchesSearch && matchesStatus && matchesMethod &&
        matchesGateway && matchesClient && matchesFrom && matchesTo
      );
    });
  }, [data, search, status, method, gateway, client, dateFrom, dateTo]);

  const { page, setPage, pageItems, total } = usePagination(rows, PAGE_SIZE);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  // TODO(you): wire these to the backend.
  const handleEdit = (p: Payment) => {
    console.log("Edit payment:", p.id);
  };
  const handleDelete = (id: string) => {
    console.log("Delete payment:", id);
    setPendingDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every payment received across your invoices."
      />

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => resetPage(setSearch)(e.target.value)}
                placeholder="Search by invoice or client…"
                className="pl-8"
              />
            </div>
            <RecordPaymentDialog />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              value={status}
              onValueChange={(v) => resetPage(setStatus)(v as PaymentStatus | "ALL")}
              options={paymentStatusFilterOptions}
              className="w-[140px]"
            />
            <SelectField
              value={method}
              onValueChange={(v) => resetPage(setMethod)(v as PaymentMethod | "ALL")}
              options={paymentMethodFilterOptions}
              className="w-[140px]"
            />
            <SelectField
              value={gateway}
              onValueChange={resetPage(setGateway)}
              options={gatewayOptions}
              className="w-[140px]"
            />
            <Combobox
              value={client}
              onValueChange={resetPage(setClient)}
              options={clientOptions}
              placeholder="All clients"
              searchPlaceholder="Search clients…"
              className="w-[180px]"
            />
            <Input
              type="date"
              aria-label="From date"
              value={dateFrom}
              onChange={(e) => resetPage(setDateFrom)(e.target.value)}
              className="w-[150px]"
            />
            <Input
              type="date"
              aria-label="To date"
              value={dateTo}
              onChange={(e) => resetPage(setDateTo)(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-56 p-0">
                  <EmptyState
                    icon={CreditCard}
                    title="No payments found"
                    description="Try adjusting your filters, or record a payment."
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.paidAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/invoices/${p.invoiceId}`} className="hover:underline">
                      {p.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.clientName}</TableCell>
                  <TableCell>{paymentMethodLabel[p.method]}</TableCell>
                  <TableCell className="text-muted-foreground">{p.gateway ?? "—"}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.amount, p.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Payment actions" />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(p)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        {p.status === "COMPLETED" && (
                          <DropdownMenuItem onClick={() => setRefundFor(p)}>
                            <Undo2 className="size-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && total > 0 && (
        <DataTablePagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}

      <RefundDialog
        payment={refundFor}
        open={!!refundFor}
        onOpenChange={(o) => !o && setRefundFor(null)}
      />


      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the payment for{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.invoiceNumber}
              </span>{" "}
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pendingDelete && handleDelete(pendingDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
