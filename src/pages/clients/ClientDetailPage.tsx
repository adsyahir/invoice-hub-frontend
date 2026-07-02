import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClient } from "@/lib/api/services/queries";
import { formatDate } from "@/lib/format";

/** A single read-only label/value pair. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{children || <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);

  if (isLoading) {
    return <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />;
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Client not found.</p>
        <Button variant="outline" onClick={() => navigate("/clients")}>
          Back to clients
        </Button>
      </div>
    );
  }

  const location = [client.city, client.state, client.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to="/clients" />}
          aria-label="Back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <PageHeader
          title={client.name}
          description="Client details."
          actions={
            <Button render={<Link to={`/clients/${client.uuid}/edit`} />}>
              <Pencil className="size-4" />
              Edit
            </Button>
          }
        />
      </div>

      <div className="flex flex-col max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">{client.name}</Field>
            <Field label="Email">{client.email}</Field>
            <Field label="Phone">{client.phone}</Field>
            <Field label="Tax ID">{client.taxId}</Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Street address">{client.addressLine1}</Field>
            </div>
            <Field label="Country">{client.country}</Field>
            <Field label="State">{client.state}</Field>
            <Field label="City">{client.city}</Field>
            <Field label="Postcode">{client.postcode}</Field>
            {location && (
              <div className="sm:col-span-2">
                <Field label="Location">{location}</Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency">{client.currency}</Field>
            <Field label="Payment terms">Net {client.paymentTermsDays}</Field>
            <Field label="Added">{formatDate(client.createdAt)}</Field>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
