import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { Combobox } from "@/components/common/Combobox";
import { useInvoices } from "@/lib/api/services/queries";
import { paymentMethodOptions } from "@/lib/options";
import {api} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/services/queries";
interface RecordPaymentDialogProps {
  /** Controlled open state (omit to use the built-in trigger button). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pre-select an invoice when opened (e.g. from a row action). */
  presetInvoiceId?: string;
  /** Render the default "Record payment" button trigger. Default true. */
  showTrigger?: boolean;
}

export function RecordPaymentDialog({
  open: openProp,
  onOpenChange,
  presetInvoiceId,
  showTrigger = true,
}: RecordPaymentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  // Controlled if the parent passes open/onOpenChange; otherwise self-managed.
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");   // string so the field can be empty
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ invoice?: string; amount?: string }>({});
  const { data: invoices } = useInvoices();
  const qc = useQueryClient();   // ← the cache controller

  // Invoice picker is only needed when no invoice was preset (global "Record
  // payment"). Opened from a row, the invoice is fixed via presetInvoiceId.
  const openInvoices = (invoices ?? []).filter(
    (i) => i.amountDue > 0 && i.status !== "VOID",
  );
  const invoiceOptions = openInvoices.map((i) => ({
    value: i.id,
    label: `${i.invoiceNumber} — ${i.client?.name}`,
  }));

  // When opened with a preset invoice, select it.
  useEffect(() => {
    if (open && presetInvoiceId) setInvoiceId(presetInvoiceId);
  }, [open, presetInvoiceId]);

  const reset = () => {
    setInvoiceId("");
    setAmount("");
    setMethod("BANK_TRANSFER");
    setReference("");
    setErrors({});
  };

const submit = async () => {
  // Validate on submit — errors show below each input.
  const nextErrors: { invoice?: string; amount?: string } = {};
  if (!invoiceId) nextErrors.invoice = "Please select an invoice";
  if (Number(amount) <= 0) nextErrors.amount = "Enter an amount greater than 0";
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;

  setSubmitting(true);   // disable the button + show spinner while in flight
  try {
    await api.payments.recordManual({ invoiceId, amount: Number(amount), method, reference });

    // Fire-and-forget: refetch the affected lists in the background (a payment
    // changes the invoice's balance too). No need to block closing the dialog.
    qc.invalidateQueries({ queryKey: queryKeys.payments });
    qc.invalidateQueries({ queryKey: queryKeys.invoices });
    setOpen(false);
    reset();
    toast.success("Payment recorded", {
      description: "The invoice balance has been updated.",
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to record payment", {
      description: "Please check the details and try again.",
    });
  } finally {
    setSubmitting(false);   // re-enable whether it succeeded or failed
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" />
          Record payment
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Log an offline payment (bank transfer, cash) against an open invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!presetInvoiceId && (
            <FormRow label="Invoice" htmlFor="pay-invoice" required error={errors.invoice}>
              <Combobox
                id="pay-invoice"
                value={invoiceId}
                onValueChange={(v) => {
                  setInvoiceId(v);
                  setErrors((e) => ({ ...e, invoice: undefined }));
                }}
                options={invoiceOptions}
                placeholder="Select an open invoice"
                searchPlaceholder="Search invoices…"
                emptyText="No open invoices."
              />
            </FormRow>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Amount" htmlFor="pay-amount" required error={errors.amount}>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((er) => ({ ...er, amount: undefined }));
                }}
                className="tabular-nums"
                placeholder="0.00"
              />
            </FormRow>
            <FormRow label="Method" htmlFor="pay-method">
              <SelectField
                id="pay-method"
                value={method}
                onValueChange={setMethod}
                options={paymentMethodOptions}
              />
            </FormRow>
          </div>
          <FormRow label="Reference" htmlFor="pay-ref" hint="Bank reference or receipt no.">
            <Input
              id="pay-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. MBB-TT-99821"
            />
          </FormRow>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Record payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
