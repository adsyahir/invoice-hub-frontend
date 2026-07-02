import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currencyOptions } from "@/lib/options";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

/** A single read-only field in view mode. */
function ViewField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

export default function SettingsPage() {
  const tenant = useAuthStore((s) => s.tenant);

  const [editing, setEditing] = useState(false);

  const [organizationName, setOrganizationName] = useState(tenant?.name ?? "");
  const [workspaceSubdomain, setWorkspaceSubdomain] = useState(tenant?.slug ?? "");
  const [billingEmail, setBillingEmail] = useState("billing@novosoft.dev");
  const [defaultCurrency, setDefaultCurrency] = useState("MYR");
  const [taxId, setTaxId] = useState("C20211234567");

  const [submitting, setSubmitting] = useState(false);
  // Field-level errors from the backend ({ errors: { field: message } }).
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  console.log("Tenant:", tenant);
  const clearError = (field: string) =>
    setServerErrors((e) => ({ ...e, [field]: undefined as unknown as string }));

  // Snapshot of the last-saved values so Cancel can revert edits.
  const [saved, setSaved] = useState({
    organizationName: tenant?.name ?? "",
    workspaceSubdomain: tenant?.slug ?? "",
    billingEmail: "billing@novosoft.dev",
    defaultCurrency: "MYR",
    taxId: "C20211234567",
  });

  const currencyLabel =
    currencyOptions.find((o) => o.value === saved.defaultCurrency)?.label ??
    saved.defaultCurrency;

  const startEditing = () => {
    // Seed the form from the last-saved snapshot.
    setOrganizationName(saved.organizationName);
    setWorkspaceSubdomain(saved.workspaceSubdomain);
    setBillingEmail(saved.billingEmail);
    setDefaultCurrency(saved.defaultCurrency);
    setTaxId(saved.taxId);
    setServerErrors({});
    setEditing(true);
  };

  const cancelEditing = () => {
    setServerErrors({});
    setEditing(false);
  };

  const onSubmit = async () => {
    if (tenant?.uuid == null) {
      toast.error("No organization loaded");
      return;
    }

    setServerErrors({});
    setSubmitting(true);
    try {
      await api.settings.updateOrganization(tenant?.uuid, {
        organizationName,
        workspaceSubdomain,
        billingEmail,
        defaultCurrency,
        taxId,
      });
      // Commit the new values as the current snapshot and drop back to view mode.
      setSaved({
        organizationName,
        workspaceSubdomain,
        billingEmail,
        defaultCurrency,
        taxId,
      });
      setEditing(false);
      toast.success("Organization settings saved");
    } catch (err) {
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string> } } })
        ?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        setServerErrors(fieldErrors);
        toast.error("Please fix the highlighted fields");
      } else {
        toast.error("Could not save settings");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your organization." />
      <SettingsNav />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organization profile</CardTitle>
          <CardDescription>
            This information appears on invoices and the payment page.
          </CardDescription>
          {!editing && (
            <CardAction>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="size-4" />
                Edit
              </Button>
            </CardAction>
          )}
        </CardHeader>

        {editing ? (
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Organization name" htmlFor="org-name" required error={serverErrors.organizationName}>
                <Input
                  id="org-name"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    clearError("organizationName");
                  }}
                />
              </FormRow>
              <FormRow
                label="Workspace subdomain"
                htmlFor="org-slug"
                required
                hint={`${workspaceSubdomain || tenant?.slug}.invoicehub.app`}
                error={serverErrors.workspaceSubdomain}
              >
                <Input
                  id="org-slug"
                  value={workspaceSubdomain}
                  onChange={(e) => {
                    setWorkspaceSubdomain(e.target.value);
                    clearError("workspaceSubdomain");
                  }}
                />
              </FormRow>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Billing email" htmlFor="org-email" required error={serverErrors.billingEmail}>
                <Input
                  id="org-email"
                  type="email"
                  value={billingEmail}
                  onChange={(e) => {
                    setBillingEmail(e.target.value);
                    clearError("billingEmail");
                  }}
                />
              </FormRow>
              <FormRow label="Default currency" htmlFor="org-currency" required error={serverErrors.defaultCurrency}>
                <SelectField
                  id="org-currency"
                  options={currencyOptions}
                  value={defaultCurrency}
                  onValueChange={(v) => {
                    setDefaultCurrency(v);
                    clearError("defaultCurrency");
                  }}
                />
              </FormRow>
            </div>
            <FormRow label="Registration / Tax ID" htmlFor="org-tax" error={serverErrors.taxId}>
              <Input
                id="org-tax"
                placeholder="C20100012345"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </FormRow>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewField label="Organization name" value={saved.organizationName} />
              <ViewField
                label="Workspace subdomain"
                value={`${saved.workspaceSubdomain}.invoicehub.app`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewField label="Billing email" value={saved.billingEmail} />
              <ViewField label="Default currency" value={currencyLabel} />
            </div>
            <ViewField label="Registration / Tax ID" value={saved.taxId} />
          </CardContent>
        )}
      </Card>
    </>
  );
}
