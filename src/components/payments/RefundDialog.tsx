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
import { useRefundPayment } from "@/lib/api/services/queries";
import { formatCurrency } from "@/lib/format";
import type { Payment } from "@/types";

interface Props {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ payment, open, onOpenChange }: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const refund = useRefundPayment();

  const submit = () => {
    if (!payment) return;
    refund.mutate(
      { paymentId: payment.id, amount, reason },
      {
        onSuccess: () => {
          toast.success("Refund initiated", {
            description: `${formatCurrency(
              Number(amount) || payment.amount,
              payment.currency,
            )} will be returned to the customer.`,
          });
          onOpenChange(false);
          setAmount("");
          setReason("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund payment</DialogTitle>
          <DialogDescription>
            {payment
              ? `Refund ${payment.invoiceNumber} via ${payment.gateway ?? "the gateway"}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormRow
            label="Refund amount"
            htmlFor="refund-amount"
            hint={
              payment
                ? `Original payment: ${formatCurrency(payment.amount, payment.currency)}`
                : undefined
            }
          >
            <Input
              id="refund-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={payment ? String(payment.amount) : "0.00"}
              className="tabular-nums"
            />
          </FormRow>
          <FormRow label="Reason" htmlFor="refund-reason">
            <Textarea
              id="refund-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for the refund"
            />
          </FormRow>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={refund.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Issue refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
