import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function InvoiceCreatePage() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link to="/invoices" />} aria-label="Back">
          <ChevronLeft className="size-4" />
        </Button>
        <PageHeader title="New invoice" description="Draft a new invoice for a client." />
      </div>
      <InvoiceForm />
    </>
  );
}
