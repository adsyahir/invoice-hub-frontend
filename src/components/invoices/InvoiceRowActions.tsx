import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Copy,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  useDuplicateInvoice,
  useSendInvoice,
  useVoidInvoice,
} from "@/lib/api/services/queries";
import type { Invoice } from "@/types";

export function InvoiceRowActions({ invoice }: { invoice: Invoice }) {
  const navigate = useNavigate();
  const [voidOpen, setVoidOpen] = useState(false);
  const send = useSendInvoice();
  const duplicate = useDuplicateInvoice();
  const voidInvoice = useVoidInvoice();

  const isDraft = invoice.status === "DRAFT";
  const canVoid = !["VOID", "PAID", "REFUNDED"].includes(invoice.status);
  const canSend = isDraft || invoice.status === "SENT";

  const handleSend = () =>
    send.mutate(invoice.id, {
      onSuccess: () =>
        toast.success(`${invoice.invoiceNumber} sent`, {
          description: `Emailed to ${invoice.client?.email ?? "the client"}.`,
        }),
    });

  const handleDuplicate = () =>
    duplicate.mutate(invoice.id, {
      onSuccess: () =>
        toast.success("Invoice duplicated", {
          description: "A new draft has been created.",
        }),
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Invoice actions" />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>
          {isDraft && (
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          )}
          {canSend && (
            <DropdownMenuItem onClick={handleSend}>
              <Send className="size-4" />
              {isDraft ? "Send" : "Resend"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toast.info("Generating PDF…")}
          >
            <Download className="size-4" />
            Download PDF
          </DropdownMenuItem>
          {canVoid && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setVoidOpen(true)}
              >
                <Ban className="size-4" />
                Void
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={voidOpen} onOpenChange={setVoidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void {invoice.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the invoice as void and stops it from accepting
              payments. An audit log entry will be recorded. This can’t be undone.
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
    </>
  );
}
