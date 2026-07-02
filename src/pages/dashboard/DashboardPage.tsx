import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Clock,
  FileText,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InvoiceStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAgingReport,
  useDashboardStats,
  useInvoices,
  useRevenueSeries,
} from "@/lib/api/services/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const stats = useDashboardStats();
  const revenue = useRevenueSeries();
  const aging = useAgingReport();
  const invoices = useInvoices();
  const recent = (invoices.data ?? []).slice(0, 5);
  const agingTotal = (aging.data ?? []).reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your invoicing and payments at a glance."
        actions={
          <Button render={<Link to="/invoices/new" />}>New invoice</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.isLoading || !stats.data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total invoiced"
              value={formatCurrency(stats.data.totalInvoiced)}
              icon={FileText}
              delta={stats.data.invoicedChange}
              sublabel="vs last month"
            />
            <StatCard
              label="Total paid"
              value={formatCurrency(stats.data.totalPaid)}
              icon={Banknote}
              delta={stats.data.paidChange}
              sublabel="vs last month"
            />
            <StatCard
              label="Outstanding"
              value={formatCurrency(stats.data.outstanding)}
              icon={Wallet}
              sublabel={`${stats.data.invoiceCount - stats.data.paidCount} open invoices`}
            />
            <StatCard
              label="Overdue"
              value={formatCurrency(stats.data.totalOverdue)}
              icon={Clock}
              sublabel={`${stats.data.overdueCount} invoices`}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Invoiced vs collected, last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {revenue.data ? (
              <RevenueChart data={revenue.data} />
            ) : (
              <Skeleton className="h-[280px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts receivable aging</CardTitle>
            <CardDescription>{formatCurrency(agingTotal)} outstanding</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(aging.data ?? []).map((b) => {
              const pct = agingTotal ? (b.amount / agingTotal) * 100 : 0;
              return (
                <div key={b.bucket} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{b.bucket}</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Latest activity across your workspace</CardDescription>
          </div>
          <Button variant="ghost" size="sm" render={<Link to="/invoices" />}>
            View all <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : recent.map((inv) => (
                    <TableRow key={inv.id} className="cursor-default">
                      <TableCell className="font-medium">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {inv.client?.name}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
