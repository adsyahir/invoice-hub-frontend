import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { queryKeys, useClients, useUpdateInvoice } from "@/lib/api/services/queries";
import { currencyOptions } from "@/lib/options";
import { computeInvoiceTotals, lineTotal } from "@/lib/invoice-totals";
import { formatCurrency } from "@/lib/format";
import type { CurrencyCode, Invoice } from "@/types";

// No client-side schema — the backend is the single source of validation.
type LineItemValues = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type FormValues = {
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  discountAmount: number;
  notes?: string;
  internalNotes?: string;
  lineItems: LineItemValues[];
};

const blankLine = { description: "", quantity: 1, unitPrice: 0, taxRate: 8 };

function toDefaults(invoice?: Invoice): FormValues {
  if (!invoice) {
    const today = "2026-06-13";
    return {
      invoiceNumber: "",
      clientId: "",
      issueDate: today,
      dueDate: "2026-07-13",
      currency: "MYR",
      discountAmount: 0,
      notes: "Thank you for your business. Payment via FPX or card.",
      internalNotes: "",
      lineItems: [{ ...blankLine }],
    };
  }
  return {
    invoiceNumber: invoice.invoiceNumber,
    clientId: invoice.clientId,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    discountAmount: invoice.discountAmount,
    notes: invoice.notes ?? "",
    internalNotes: invoice.internalNotes ?? "",
    lineItems: invoice.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      taxRate: li.taxRate,
    })),
  };
}

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clients = useClients();
  const updateInvoice = useUpdateInvoice();
  const isEdit = !!invoice;
  const [submitting, setSubmitting] = useState(false);
  // Field-level errors from the backend ({ errors: { field: message } }).
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: toDefaults(invoice),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });

  const watchedLines = watch("lineItems");
  const watchedDiscount = watch("discountAmount");
  const currency = watch("currency") as CurrencyCode;
  const totals = computeInvoiceTotals(watchedLines ?? [], watchedDiscount);

  const clientOptions = (clients.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const onSubmit = async (values: FormValues) => {
    // Edit has no backend endpoint yet — keep the existing stubbed behavior.
    if (isEdit) {
      updateInvoice.mutate(values, {
        onSuccess: () => {
          toast.success("Invoice updated", { description: `${invoice?.invoiceNumber} saved.` });
          navigate(`/invoices/${invoice!.id}`);
        },
      });
      return;
    }

    const payload = {
      invoiceNumber: values.invoiceNumber,
      clientId: values.clientId,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      currency: values.currency,
      notes: values.notes,
      internalNotes: values.internalNotes,
      // Only the client-supplied fields; the backend recomputes all amounts.
      lineItems: values.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        taxRate: li.taxRate,
      })),
    };

    setServerErrors({});
    setSubmitting(true);
    try {
      const result = await api.invoices.create(payload);
      await qc.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success("Invoice created", {
        description: `${result.invoiceNumber} saved as a draft.`,
      });
      navigate("/invoices");
    } catch (err) {
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string> } } })
        ?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        setServerErrors(fieldErrors);
        toast.error("Please fix the highlighted fields");
      } else {
        toast.error("Could not create invoice");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || updateInvoice.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-3 lg:items-start"
    >
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow
                label="Invoice number"
                htmlFor="invoiceNumber"
                required
                error={errors.invoiceNumber?.message ?? serverErrors.invoiceNumber}
              >
                <Input id="invoiceNumber" placeholder="INV-2026-0001" {...register("invoiceNumber")} />
              </FormRow>
              <FormRow
                label="Client"
                htmlFor="clientId"
                required
                error={errors.clientId?.message ?? serverErrors.clientId}
              >
                <SelectField
                  id="clientId"
                  value={watch("clientId")}
                  onValueChange={(v) => setValue("clientId", v, { shouldValidate: true })}
                  options={clientOptions}
                  placeholder="Select a client"
                />
              </FormRow>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormRow
                label="Issue date"
                htmlFor="issueDate"
                required
                error={errors.issueDate?.message ?? serverErrors.issueDate}
              >
                <Input id="issueDate" type="date" {...register("issueDate")} />
              </FormRow>
              <FormRow
                label="Due date"
                htmlFor="dueDate"
                required
                error={errors.dueDate?.message ?? serverErrors.dueDate}
              >
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </FormRow>
              <FormRow label="Currency" htmlFor="currency" error={serverErrors.currency}>
                <SelectField
                  id="currency"
                  value={watch("currency")}
                  onValueChange={(v) => setValue("currency", v)}
                  options={currencyOptions}
                />
              </FormRow>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Line items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...blankLine })}
            >
              <Plus className="size-4" />
              Add line
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="hidden grid-cols-[1fr_80px_110px_80px_110px_36px] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit price</span>
              <span className="text-right">Tax %</span>
              <span className="text-right">Amount</span>
              <span />
            </div>

            {fields.map((field, index) => {
              const line = watchedLines?.[index] ?? blankLine;
              const lineErr = errors.lineItems?.[index];
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-[1fr_80px_110px_80px_110px_36px] sm:items-center sm:rounded-none sm:border-0 sm:p-0"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Description"
                      aria-invalid={!!lineErr?.description}
                      {...register(`lineItems.${index}.description`)}
                    />
                  </div>
                  <Input
                    type="number"
                    step="1"
                    className="text-right tabular-nums"
                    aria-invalid={!!lineErr?.quantity}
                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    className="text-right tabular-nums"
                    aria-invalid={!!lineErr?.unitPrice}
                    {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    className="text-right tabular-nums"
                    {...register(`lineItems.${index}.taxRate`, { valueAsNumber: true })}
                  />
                  <div className="flex h-8 items-center justify-end text-sm font-medium tabular-nums">
                    {formatCurrency(lineTotal(line), currency)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove line"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}

            {(errors.lineItems?.root?.message || serverErrors.lineItems) && (
              <p className="text-xs text-destructive">
                {errors.lineItems?.root?.message ?? serverErrors.lineItems}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormRow label="Notes to client" hint="Shown on the invoice and PDF.">
              <Textarea rows={3} {...register("notes")} />
            </FormRow>
            <FormRow label="Internal notes" hint="Only your team can see these.">
              <Textarea rows={2} {...register("internalNotes")} />
            </FormRow>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (SST)</span>
            <span className="tabular-nums">{formatCurrency(totals.taxAmount, currency)}</span>
          </div>
          <FormRow label="Discount" htmlFor="discount">
            <Input
              id="discount"
              type="number"
              step="0.01"
              className="text-right tabular-nums"
              {...register("discountAmount", { valueAsNumber: true })}
            />
          </FormRow>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(totals.total, currency)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Totals shown for preview. Final amounts are calculated server-side.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create invoice"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
