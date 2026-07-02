import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import {
  Ban,
  Calendar,
  CalendarClock,
  ChevronLeft,
  Copy,
  CreditCard,
  Download,
  FileWarning,
  Link2,
  Pencil,
  ReceiptText,
  Send,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  InvoiceStatusBadge,
  PaymentStatusBadge,
} from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CreditNoteDialog } from "@/components/invoices/CreditNoteDialog";
import {
  useInvoice,
  useInvoiceAuditLog,
  useInvoicePayments,
  useSendInvoice,
  useDuplicateInvoice,
  useVoidInvoice,
} from "@/lib/api/services/queries";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { paymentMethodLabel, invoiceStatusStyle } from "@/lib/status";
import { useAuthStore } from "@/stores/auth-store";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tenant = useAuthStore((s) => s.tenant);
  const { data: invoice, isLoading } = useInvoice(id);
  const payments = useInvoicePayments(id);
  const audit = useInvoiceAuditLog(id);
  const send = useSendInvoice();
  const duplicate = useDuplicateInvoice();
  const voidInvoice = useVoidInvoice();
  const [voidOpen, setVoidOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }
  if (!invoice) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Invoice not found"
        action={<Button render={<Link to="/invoices" />}>Back to invoices</Button>}
      />
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const canVoid = !["VOID", "PAID", "REFUNDED"].includes(invoice.status);
  const canSend = isDraft || invoice.status === "SENT";
  const canCredit = invoice.status === "PAID";

  const settled = ["PAID", "VOID", "REFUNDED"].includes(invoice.status);
  const daysToDue = differenceInCalendarDays(new Date(invoice.dueDate), new Date());
  const overdue = !settled && invoice.amountDue > 0 && daysToDue < 0;
  const dueHint = settled
    ? null
    : overdue
      ? `Overdue by ${Math.abs(daysToDue)} day${Math.abs(daysToDue) === 1 ? "" : "s"}`
      : daysToDue === 0
        ? "Due today"
        : `Due in ${daysToDue} day${daysToDue === 1 ? "" : "s"}`;

  const stats: {
    icon: LucideIcon;
    label: string;
    value: string;
    hint?: string | null;
    emphasize?: boolean;
  }[] = [
    {
      icon: ReceiptText,
      label: "Amount Due",
      value: formatCurrency(invoice.amountDue, invoice.currency),
      emphasize: true,
    },
    {
      icon: CreditCard,
      label: "Total Paid",
      value: formatCurrency(invoice.amountPaid, invoice.currency),
    },
    { icon: Calendar, label: "Issue Date", value: formatDate(invoice.issueDate) },
    {
      icon: CalendarClock,
      label: "Due Date",
      value: formatDate(invoice.dueDate),
      hint: dueHint,
    },
  ];

  const copyLink = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/pay/${invoice.paymentLinkToken ?? "demo-token"}`,
    );
    toast.success("Payment link copied");
  };

  const handleSend = () =>
    send.mutate(invoice.id, {
      onSuccess: () =>
        toast.success(`${invoice.invoiceNumber} sent`, {
          description: `Emailed to ${invoice.client?.email ?? "the client"}.`,
        }),
    });

  const handleDuplicate = () =>
    duplicate.mutate(invoice.id, {
      onSuccess: () => toast.success("Invoice duplicated as a new draft."),
    });

  const handleVoid = () =>
    voidInvoice.mutate(invoice.id, {
      onSuccess: () => {
        setVoidOpen(false);
        toast.success(`${invoice.invoiceNumber} voided`);
      },
    });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link to="/invoices" />}
            aria-label="Back to invoices"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">{invoice.client?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => toast.info("Generating PDF…")}>
            <Download className="size-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="size-4" />
            Duplicate
          </Button>
          {canCredit && (
            <Button variant="outline" onClick={() => setCreditOpen(true)}>
              <ReceiptText className="size-4" />
              Credit note
            </Button>
          )}
          {canVoid && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setVoidOpen(true)}
            >
              <Ban className="size-4" />
              Void
            </Button>
          )}
          {isDraft && (
            <Button variant="outline" render={<Link to={`/invoices/${invoice.id}/edit`} />}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
          {canSend && (
            <Button onClick={handleSend}>
              <Send className="size-4" />
              {isDraft ? "Send Invoice" : "Resend"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        {/* LEFT — Customer & Details */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-5 pt-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Customer &amp; Details</h2>
              <div className="flex flex-col gap-1 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Client
                </p>
                <button
                  className="font-medium hover:underline"
                  onClick={() => navigate(`/clients/${invoice.clientId}`)}
                >
                  {invoice.client?.name}
                </button>
                {invoice.client?.addressLine1 && (
                  <p className="text-muted-foreground">
                    {invoice.client.addressLine1}
                    {invoice.client.city ? `, ${invoice.client.city}` : ""}
                  </p>
                )}
                {invoice.client?.phone && (
                  <p className="text-muted-foreground">{invoice.client.phone}</p>
                )}
                <p className="text-muted-foreground">
                  Terms: Net {invoice.client?.paymentTermsDays ?? 30}
                </p>
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="details" className="flex-col">
              <TabsList className="w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="payments">
                  Payments ({payments.data?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex flex-col gap-4 pt-2 text-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Client
                  </p>
                  <p className="font-medium">{invoice.client?.name}</p>
                  <p className="text-muted-foreground">{invoice.client?.email}</p>
                  {invoice.client?.phone && (
                    <p className="text-muted-foreground">{invoice.client.phone}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="font-medium">{invoiceStatusStyle[invoice.status].label}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <p className="text-muted-foreground">{invoice.notes || "—"}</p>
                </div>
                {invoice.paymentLinkToken && (
                  <Button variant="outline" size="sm" className="w-full" onClick={copyLink}>
                    <Link2 className="size-4" />
                    Copy payment link
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="payments" className="pt-2">
                {payments.data && payments.data.length > 0 ? (
                  <ul className="flex flex-col gap-3 text-sm">
                    {payments.data.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2">
                        <div className="leading-tight">
                          <p className="font-medium">{paymentMethodLabel[p.method]}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(p.paidAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="tabular-nums">
                            {formatCurrency(p.amount, p.currency)}
                          </p>
                          <PaymentStatusBadge status={p.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No payments yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="activity" className="pt-2">
                <ol className="flex flex-col gap-4">
                  {(audit.data ?? []).map((log) => (
                    <li key={log.id} className="flex gap-3">
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">
                          {log.action.replaceAll("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.performedByName ?? "System"} · {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* RIGHT — stat band + document */}
        <div className="flex flex-col gap-6">
          {/* Stat band */}
          <Card className="overflow-hidden py-0">
            <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 sm:[&>*:nth-child(n+2)]:border-l">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <s.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p
                      className={
                        s.emphasize
                          ? "truncate text-lg font-semibold tabular-nums text-primary"
                          : "truncate text-lg font-semibold tabular-nums"
                      }
                    >
                      {s.value}
                    </p>
                    {s.hint && (
                      <p
                        className={
                          overdue
                            ? "text-xs font-medium text-destructive"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {s.hint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Document */}
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Bill to
                  </p>
                  <p className="font-medium">{invoice.client?.name}</p>
                  <p className="text-muted-foreground">{invoice.client?.email}</p>
                  {invoice.client?.addressLine1 && (
                    <p className="text-muted-foreground">
                      {invoice.client.addressLine1}
                      {invoice.client.city ? `, ${invoice.client.city}` : ""}
                    </p>
                  )}
                  {invoice.client?.taxId && (
                    <p className="text-muted-foreground">Tax ID: {invoice.client.taxId}</p>
                  )}
                </div>
                <div className="text-right">
                  <InvoiceStatusBadge status={invoice.status} />
                  {tenant?.name && (
                    <p className="mt-1 text-xs text-muted-foreground">From {tenant.name}</p>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((li) => (
                      <TableRow key={li.id}>
                        <TableCell className="font-medium">{li.description}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {li.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(li.unitPrice, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {li.taxRate}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(li.lineTotal, invoice.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="flex flex-col w-full max-w-xs gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoice.subtotal, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (SST)</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoice.taxAmount, invoice.currency)}
                    </span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="tabular-nums">
                        −{formatCurrency(invoice.discountAmount, invoice.currency)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Paid</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Amount due</span>
                    <span className="tabular-nums text-primary">
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="text-sm">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="text-muted-foreground">
                  {invoice.notes || "Thank you for your business."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={voidOpen} onOpenChange={setVoidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void {invoice.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the invoice as void and stops it accepting payments. An
              audit log entry will be recorded. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoid}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Void invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreditNoteDialog invoice={invoice} open={creditOpen} onOpenChange={setCreditOpen} />
    </>
  );
}
