import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/common/FormRow";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/types";

interface Props {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditNoteDialog({ invoice, open, onOpenChange }: Props) {
  const [amount, setAmount] = useState(invoice.totalAmount);
  const [reason, setReason] = useState("");

  const submit = () => {
    // TODO(backend): POST credit note against this invoice.
    toast.success("Credit note issued", {
      description: `${formatCurrency(amount, invoice.currency)} credited against ${invoice.invoiceNumber}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue credit note</DialogTitle>
          <DialogDescription>
            Credit a paid invoice. A linked credit note with a new number and a
            fresh PDF will be generated.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormRow label="Credit amount" htmlFor="credit-amount">
            <Input
              id="credit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="tabular-nums"
            />
          </FormRow>
          <FormRow label="Reason" htmlFor="credit-reason" hint="Shown on the credit note.">
            <Textarea
              id="credit-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Overcharge on line item 2"
            />
          </FormRow>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={amount <= 0}>
            Issue credit note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
