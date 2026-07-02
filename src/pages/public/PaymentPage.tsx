import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  LinkIcon,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { EmptyState } from "@/components/common/EmptyState";
import { usePublicInvoice } from "@/lib/api/services/queries";
import { formatCurrency, formatDate } from "@/lib/format";

const banks = [
  { value: "maybank2u", label: "Maybank2U" },
  { value: "cimb", label: "CIMB Clicks" },
  { value: "publicbank", label: "Public Bank" },
  { value: "rhb", label: "RHB Now" },
  { value: "hongleong", label: "Hong Leong Connect" },
];

export default function PaymentPage() {
  const { token } = useParams();
  const { data: invoice, isLoading, isError } = usePublicInvoice(token);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  const pay = () => {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1400);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <EmptyState
          icon={LinkIcon}
          title="This payment link has expired"
          description="Payment links are valid for 7 days. Please contact the sender for a new link."
        />
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You paid {formatCurrency(invoice.amountDue, invoice.currency)} for{" "}
          {invoice.invoiceNumber}. A receipt has been emailed to you.
        </p>
        <Card className="mt-6 text-left">
          <CardContent className="flex flex-col gap-2 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(invoice.amountDue, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-medium">PAY-{invoice.invoiceNumber.slice(-4)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 md:grid-cols-5">
      {/* Invoice summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardDescription>Invoice from Novosoft Sdn Bhd</CardDescription>
          <CardTitle>{invoice.invoiceNumber}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Billed to</p>
            <p className="font-medium">{invoice.client?.name}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due date</span>
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            {invoice.lineItems.map((li) => (
              <div key={li.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground line-clamp-1">
                  {li.description}
                </span>
                <span className="tabular-nums">
                  {formatCurrency(li.lineTotal, invoice.currency)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Amount due</span>
            <span className="tabular-nums">
              {formatCurrency(invoice.amountDue, invoice.currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Choose how to pay</CardTitle>
          <CardDescription>Secure payment powered by InvoiceHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="card">
            <TabsList className="w-full">
              <TabsTrigger value="card" className="flex-1">
                <CreditCard className="size-4" /> Card
              </TabsTrigger>
              <TabsTrigger value="fpx" className="flex-1">
                <Landmark className="size-4" /> FPX
              </TabsTrigger>
              <TabsTrigger value="ewallet" className="flex-1">
                <Smartphone className="size-4" /> E-wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="flex flex-col gap-4 pt-4">
              <FormRow label="Card number" htmlFor="card-number">
                <Input id="card-number" placeholder="4242 4242 4242 4242" inputMode="numeric" />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Expiry" htmlFor="card-exp">
                  <Input id="card-exp" placeholder="MM / YY" />
                </FormRow>
                <FormRow label="CVC" htmlFor="card-cvc">
                  <Input id="card-cvc" placeholder="123" inputMode="numeric" />
                </FormRow>
              </div>
              <FormRow label="Name on card" htmlFor="card-name">
                <Input id="card-name" placeholder="Full name" />
              </FormRow>
            </TabsContent>

            <TabsContent value="fpx" className="flex flex-col gap-4 pt-4">
              <FormRow label="Select your bank" htmlFor="fpx-bank">
                <SelectField id="fpx-bank" options={banks} placeholder="Choose a bank" />
              </FormRow>
              <p className="text-sm text-muted-foreground">
                You’ll be redirected to your bank to authorise the payment.
              </p>
            </TabsContent>

            <TabsContent value="ewallet" className="flex flex-col gap-3 pt-4">
              <div className="grid grid-cols-3 gap-2">
                {["Touch ’n Go", "GrabPay", "Boost"].map((w) => (
                  <button
                    key={w}
                    className="rounded-lg border p-3 text-sm font-medium hover:border-primary hover:bg-muted"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={status === "processing"}
            onClick={pay}
          >
            {status === "processing" && <Loader2 className="size-4 animate-spin" />}
            Pay {formatCurrency(invoice.amountDue, invoice.currency)}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Payments are encrypted and processed securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
