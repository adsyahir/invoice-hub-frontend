import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAgingReport,
  useDashboardStats,
  useRevenueSeries,
} from "@/lib/api/services/queries";
import { formatCurrency } from "@/lib/format";

export default function ReportsPage() {
  const aging = useAgingReport();
  const revenue = useRevenueSeries();
  const stats = useDashboardStats();

  const agingTotal = (aging.data ?? []).reduce((s, b) => s + b.amount, 0);
  const agingCount = (aging.data ?? []).reduce((s, b) => s + b.count, 0);

  const exportFile = (kind: string) =>
    toast.success(`Preparing ${kind} export`, {
      description: "We’ll email a download link when it’s ready.",
    });

  return (
    <>
      <PageHeader
        title="Reports"
        description="Revenue performance and accounts receivable health."
        actions={
          <>
            <Button variant="outline" onClick={() => exportFile("CSV")}>
              <FileSpreadsheet className="size-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportFile("PDF")}>
              <Download className="size-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Invoiced (YTD)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.data ? formatCurrency(stats.data.totalInvoiced) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Collected (YTD)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.data ? formatCurrency(stats.data.totalPaid) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Collection rate</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.data
                ? `${Math.round((stats.data.totalPaid / stats.data.totalInvoiced) * 100)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue trend</CardTitle>
          <CardDescription>Invoiced vs collected by month</CardDescription>
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
          <CardDescription>
            Outstanding balances grouped by how overdue they are.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aging bucket</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(aging.data ?? []).map((b) => (
                <TableRow key={b.bucket}>
                  <TableCell className="font-medium">{b.bucket}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.count}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(b.amount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {agingTotal ? Math.round((b.amount / agingTotal) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {agingCount}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(agingTotal)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">100%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
