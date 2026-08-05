import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, CreditCard, Landmark, LinkIcon, Loader2, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { usePublicInvoice, useStartCheckout } from "@/lib/api/services/queries";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * The page an emailed payment link opens.
 *
 * No card fields of our own: collecting a PAN would drag InvoiceHub into PCI scope for no
 * benefit. The Pay button mints a Stripe Checkout session and redirects; Stripe collects
 * the card or FPX details and tells us the outcome by webhook.
 *
 * Note what the success state does NOT claim. Landing back here only means the payer
 * finished Stripe's flow — the money is confirmed by the webhook, and FPX in particular
 * can still be pending. So the copy says "received", and the invoice's real status comes
 * from the refetched server data rather than from `?paid=1`.
 */
export default function PaymentPage() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const { data: invoice, isLoading, isError } = usePublicInvoice(token);
  const checkout = useStartCheckout(token);

  const justPaid = params.get("paid") === "1";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState
          icon={LinkIcon}
          title="This payment link isn’t valid"
          description="It may have expired or already been used. Please contact the sender for a new link."
        />
      </div>
    );
  }

  const settled = invoice.amountDue <= 0;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 md:grid-cols-5">
      {/* Invoice summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardDescription>Invoice from {invoice.organizationName}</CardDescription>
          <CardTitle>{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Billed to</p>
            <p className="font-medium">{invoice.clientName}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due date</span>
            <span>{formatDate(invoice.dueDate)}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            {invoice.lineItems.map((li, i) => (
              <div key={`${li.description}-${i}`} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-muted-foreground">{li.description}</span>
                <span className="tabular-nums">
                  {formatCurrency(li.lineTotal, invoice.currency)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {invoice.amountPaid > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already paid</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.amountPaid, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Amount due</span>
            <span className="tabular-nums">
              {formatCurrency(invoice.amountDue, invoice.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="md:col-span-3">
        {settled ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                This invoice is paid
              </CardTitle>
              <CardDescription>
                Nothing left to pay on {invoice.invoiceNumber}. A receipt has been emailed to you.
              </CardDescription>
            </CardHeader>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Pay this invoice</CardTitle>
              <CardDescription>
                You’ll be taken to Stripe to complete the payment. {invoice.organizationName}{" "}
                never sees your card details, and neither do we.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {justPaid && (
                // They came back from Stripe but the balance hasn't cleared yet — either the
                // webhook is still in flight or it's an async method like FPX.
                <Alert>
                  <AlertTitle>Payment received — confirming</AlertTitle>
                  <AlertDescription>
                    This can take a moment to settle. You’ll get an emailed receipt once it’s
                    confirmed; no need to pay again.
                  </AlertDescription>
                </Alert>
              )}

              {checkout.isError && (
                <Alert variant="destructive">
                  <AlertTitle>Couldn’t start the payment</AlertTitle>
                  <AlertDescription>
                    Please try again in a moment, or contact {invoice.organizationName} to pay
                    another way.
                  </AlertDescription>
                </Alert>
              )}

              {!invoice.payable ? (
                <p className="text-sm text-muted-foreground">
                  This invoice can no longer be paid online. Please contact{" "}
                  {invoice.organizationName}.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="size-4" /> Card
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Landmark className="size-4" /> FPX
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    disabled={checkout.isPending}
                    onClick={() => checkout.mutate()}
                  >
                    {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
                    Pay {formatCurrency(invoice.amountDue, invoice.currency)}
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5" />
                    Secured by Stripe
                  </p>
                </>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
