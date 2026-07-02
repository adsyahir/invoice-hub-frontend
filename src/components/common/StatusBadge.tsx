import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  invoiceStatusStyle,
  paymentStatusStyle,
  tenantStatusStyle,
} from "@/lib/status";
import type { InvoiceStatus, PaymentStatus, TenantStatus } from "@/types";

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  const s = invoiceStatusStyle[status];
  return <Badge className={cn(s.className, className)}>{s.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = paymentStatusStyle[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const s = tenantStatusStyle[status];
  return (
    <Badge className={s.className}>
      <span className={cn("mr-1 size-1.5 rounded-full", s.dot)} />
      {s.label}
    </Badge>
  );
}
