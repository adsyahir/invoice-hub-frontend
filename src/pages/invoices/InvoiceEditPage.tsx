import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { useInvoice } from "@/lib/api/services/queries";
import { FileWarning } from "lucide-react";

export default function InvoiceEditPage() {
  const { id } = useParams();
  const { data: invoice, isLoading } = useInvoice(id);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={`/invoices/${id}`} />}
          aria-label="Back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <PageHeader
          title={invoice ? `Edit ${invoice.invoiceNumber}` : "Edit invoice"}
          description="Only draft invoices can be edited."
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : !invoice ? (
        <EmptyState icon={FileWarning} title="Invoice not found" />
      ) : invoice.status !== "DRAFT" ? (
        <EmptyState
          icon={FileWarning}
          title="This invoice can’t be edited"
          description="Only invoices in draft status can be modified."
          action={
            <Button render={<Link to={`/invoices/${invoice.id}`} />}>
              View invoice
            </Button>
          }
        />
      ) : (
        <InvoiceForm invoice={invoice} />
      )}
    </>
  );
}
