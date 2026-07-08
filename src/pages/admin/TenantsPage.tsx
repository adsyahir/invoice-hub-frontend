import { Ban, Building2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { TenantStatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useTenants, useUpdateTenantStatus } from "@/lib/api/services/queries";
import { formatDate } from "@/lib/format";

export default function TenantsPage() {
  const { data, isLoading } = useTenants();
  const updateStatus = useUpdateTenantStatus();

  const tenants = data ?? [];
  const active = tenants.filter((t) => t.status === "ACTIVE").length;
  const totalInvoices = tenants.reduce((s, t) => s + t.invoicesThisMonth, 0);
  const { page, setPage, pageItems, total } = usePagination(tenants, 10);

  const setStatus = (
    uuid: string,
    name: string,
    status: "ACTIVE" | "SUSPENDED",
  ) =>
    updateStatus.mutate(
      { uuid, status },
      {
        onSuccess: () =>
          toast.success(
            `${name} ${status === "ACTIVE" ? "reactivated" : "suspended"}`,
          ),
        onError: () => toast.error(`Could not update ${name}`),
      },
    );

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Platform-wide view of every organization on InvoiceHub."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total tenants</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{tenants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Invoices this month</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totalInvoices}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Invoices / mo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : pageItems.map((t) => (
                  <TableRow key={t.uuid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Building2 className="size-4" />
                        </div>
                        <div className="leading-tight">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.slug}.invoicehub.app
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {t.plan.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {t.userCount}
                      <span className="text-muted-foreground"> / {t.maxUsers}</span>
                    </TableCell>
                    <TableCell className="tabular-nums">{t.invoicesThisMonth}</TableCell>
                    <TableCell>
                      <TenantStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </TableCell>
                    <TableCell>
                      {t.status !== "CANCELLED" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" aria-label="Tenant actions" />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {t.status === "ACTIVE" ? (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setStatus(t.uuid, t.name, "SUSPENDED")}
                              >
                                <Ban className="size-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setStatus(t.uuid, t.name, "ACTIVE")}
                              >
                                <CheckCircle2 className="size-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && total > 0 && (
        <DataTablePagination page={page} pageSize={10} total={total} onPageChange={setPage} />
      )}
    </>
  );
}
