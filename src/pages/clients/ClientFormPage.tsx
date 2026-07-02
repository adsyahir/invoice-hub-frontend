import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FormRow } from "@/components/common/FormRow";
import { SelectField } from "@/components/common/SelectField";
import { Combobox } from "@/components/common/Combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClient } from "@/lib/api/services/queries";
import { currencyOptions, paymentTermsOptions } from "@/lib/options";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { CityResponse, PostcodeResponse, StateResponse } from "@/lib/api/services/geo";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/services/queries";

// No client-side schema — the backend is the single source of validation.
// state/city/postcode are NOT registered form fields — they're chosen via the
// comboboxes and submitted as ids (stateId/cityId/postcodeId), not names.
type Values = {
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  country?: string;
  taxId?: string;
  currency: string;
  paymentTermsDays: string;
};

export default function ClientFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    values: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      addressLine1: client?.addressLine1 ?? "",
      country: client?.country ?? "Malaysia",
      taxId: client?.taxId ?? "",
      currency: client?.currency ?? "MYR",
      paymentTermsDays: String(client?.paymentTermsDays ?? 30),
    },
  });

  const [states, setStates] = useState<StateResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [postcodes, setPostcodes] = useState<PostcodeResponse[]>([]);
  const [stateId, setStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [postcodeId, setPostcodeId] = useState<string>("");

  // Load the state list once on mount.
  useEffect(() => {
    api.geo
      .getAllStates()
      .then(setStates)
      .catch((err) => console.error("Failed to load states:", err));
  }, []);

  // Edit mode: seed the combobox selections from the loaded client. Setting
  // stateId/cityId cascades the city/postcode lists via the effects below.
  useEffect(() => {
    if (!client) return;
    if (client.stateId) setStateId(String(client.stateId));
    if (client.cityId) setCityId(String(client.cityId));
    if (client.postcodeId) setPostcodeId(String(client.postcodeId));
  }, [client]);

  // Whenever a state is picked, (re)load its cities. Clearing the state
  // empties the city list too.
  useEffect(() => {
    if (!stateId) {
      setCities([]);
      return;
    }
    api.geo
      .getCitiesByState(Number(stateId))
      .then(setCities)
      .catch((err) => console.error("Failed to load cities:", err));
  }, [stateId]);

  // Whenever a city is picked, (re)load its postcodes.
  useEffect(() => {
    if (!cityId) {
      setPostcodes([]);
      return;
    }
    api.geo
      .getPostcodesByCity(Number(cityId))
      .then(setPostcodes)
      .catch((err) => console.error("Failed to load postcodes:", err));
  }, [cityId]);

  const stateOptions = useMemo(
    () => states.map((s) => ({ value: String(s.id), label: s.name })),
    [states]
  );
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities]
  );
  const postcodeOptions = useMemo(
    () => postcodes.map((p) => ({ value: String(p.id), label: p.code })),
    [postcodes]
  );

  const [submitting, setSubmitting] = useState(false);
  // Field-level errors returned by the backend ({ errors: { field: message } }).
  // Keyed by the DTO field name so we can drop each message under its input.
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();   // ← the cache controller

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      paymentTermsDays: Number(values.paymentTermsDays),
      // Send geo as foreign-key ids; omit when nothing is selected.
      state : stateId ? Number(stateId) : undefined,
      city: cityId ? Number(cityId) : undefined,
      postcode: postcodeId ? Number(postcodeId) : undefined,
    };
    setServerErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.clients.update(id!, payload);
      } else {
        await api.clients.create(payload);
      }
        await qc.invalidateQueries({ queryKey: queryKeys.clients });  // ← refetch the list
      
      toast.success(isEdit ? "Client updated" : "Client created");
      navigate("/clients");
    } catch (err) {
      // Both bean-validation (400) and business-rule (409) responses share the
      // shape { errors: { field: message } }. Surface them under each field.
      const fieldErrors = (err as { response?: { data?: { errors?: Record<string, string> } } })
        ?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        setServerErrors(fieldErrors);
        toast.error("Please fix the highlighted fields");
      } else {
        console.error("Failed to save client:", err);
        toast.error("Could not save client");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link to="/clients" />} aria-label="Back">
          <ChevronLeft className="size-4" />
        </Button>
        <PageHeader
          title={isEdit ? client?.name ?? "Edit client" : "New client"}
          description={isEdit ? "Update billing details." : "Add a company or person to bill."}
        />
      </div>

      {isEdit && isLoading ? (
        <Skeleton className="h-96 w-full max-w-2xl rounded-xl" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-2xl gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow label="Name" htmlFor="name" required error={errors.name?.message ?? serverErrors.name}>
                  <Input id="name" placeholder="Acme Sdn Bhd" {...register("name")} />
                </FormRow>
                <FormRow label="Email" htmlFor="email" required error={errors.email?.message ?? serverErrors.email}>
                  <Input id="email" type="email" placeholder="billing@acme.com" {...register("email")} />
                </FormRow>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow label="Phone" htmlFor="phone" error={serverErrors.phone}>
                  <Input id="phone" placeholder="+60 3-1234 5678" {...register("phone")} />
                </FormRow>
                <FormRow label="Tax ID" htmlFor="taxId" hint="SST / GST / VAT number" error={serverErrors.taxId}>
                  <Input id="taxId" {...register("taxId")} />
                </FormRow>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormRow label="Street address" htmlFor="addressLine1" error={serverErrors.addressLine1}>
                <Textarea id="addressLine1" rows={3} {...register("addressLine1")} />
              </FormRow>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow label="Country" htmlFor="country" error={serverErrors.country}>
                  <Input id="country" readOnly {...register("country")} />
                </FormRow>
                <FormRow label="State" htmlFor="state" error={serverErrors.state}>
                  <Combobox
                    id="state"
                    options={stateOptions}
                    value={stateId}
                    placeholder="Select state"
                    searchPlaceholder="Search states…"
                    onValueChange={(id) => {
                      setStateId(id);
                      // Reset the dependent city + postcode when the state changes.
                      setCityId("");
                      setPostcodeId("");
                    }}
                  />
                </FormRow>
                <FormRow label="City" htmlFor="city" error={serverErrors.city}>
                  <Combobox
                    id="city"
                    options={cityOptions}
                    value={cityId}
                    placeholder="Select city"
                    searchPlaceholder="Search cities…"
                    disabled={!stateId}
                    emptyText={stateId ? "No cities found." : "Select a state first."}
                    onValueChange={(id) => {
                      setCityId(id);
                      // Reset the dependent postcode when the city changes.
                      setPostcodeId("");
                    }}
                  />
                </FormRow>
                <FormRow label="Postcode" htmlFor="postcode" error={serverErrors.postcode ?? serverErrors.postcodeId}>
                  <Combobox
                    id="postcode"
                    options={postcodeOptions}
                    value={postcodeId}
                    placeholder="Select postcode"
                    searchPlaceholder="Search postcodes…"
                    disabled={!cityId}
                    emptyText={cityId ? "No postcodes found." : "Select a city first."}
                    onValueChange={(id) => {
                      setPostcodeId(id);
                    }}
                  />
                </FormRow>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing defaults</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Currency" htmlFor="currency" error={serverErrors.currency}>
                <SelectField
                  id="currency"
                  value={watch("currency")}
                  onValueChange={(v) => setValue("currency", v)}
                  options={currencyOptions}
                />
              </FormRow>
              <FormRow label="Payment terms" htmlFor="paymentTermsDays" error={serverErrors.paymentTermsDays}>
                <SelectField
                  id="paymentTermsDays"
                  value={watch("paymentTermsDays")}
                  onValueChange={(v) => setValue("paymentTermsDays", v)}
                  options={paymentTermsOptions}
                />
              </FormRow>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate("/clients")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create client"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
