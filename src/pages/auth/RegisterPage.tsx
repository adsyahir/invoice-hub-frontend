import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/common/FormRow";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

// No client-side schema — the backend is the single source of validation.
// Server field errors are mapped back onto the form in onSubmit.
type Values = {
  orgName: string;
  slug: string;
  fullName: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { orgName: "", slug: "", fullName: "", email: "", password: "" },
  });

  const slug = watch("slug");

  const onSubmit = async (values: Values) => {
    clearErrors();
    setSubmitting(true);
    try {
      // POST /auth/register — creates the tenant + admin account.
      const data = await api.auth.register(values);
      setSession(data.user, data.token, data.tenant, data.permissions);
      navigate("/dashboard");
    } catch (err) {
      // Backend is the single source of validation. It returns
      // { errors: { field: message } } for both bean-validation and
      // duplicate slug/email; map those onto the matching fields.
      const fieldErrors =
        axios.isAxiosError(err) &&
        (err.response?.data as { errors?: Record<string, string> } | undefined)
          ?.errors;

      if (fieldErrors) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in values) {
            setError(field as keyof Values, { type: "server", message });
          } else {
            toast.error(message);
          }
        }
      } else {
        toast.error("Couldn’t create your organization", {
          description: "Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your organization
        </h1>
        <p className="text-sm text-muted-foreground">
          Start invoicing in minutes. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRow label="Organization name" htmlFor="orgName" required error={errors.orgName?.message}>
          <Input
            id="orgName"
            placeholder="Acme Sdn Bhd"
            {...register("orgName", {
              onChange: (e) => {
                if (!slug) setValue("slug", slugify(e.target.value));
              },
            })}
          />
        </FormRow>

        <FormRow
          label="Workspace subdomain"
          htmlFor="slug"
          required
          error={errors.slug?.message}
          hint={slug ? `${slug}.invoicehub.app` : "your-org.invoicehub.app"}
        >
          <Input id="slug" placeholder="acme" {...register("slug")} />
        </FormRow>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Your name" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input id="fullName" placeholder="Adam Rahman" {...register("fullName")} />
          </FormRow>
          <FormRow label="Work email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@acme.com" {...register("email")} />
          </FormRow>
        </div>

        <FormRow
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          hint="At least 8 characters."
        >
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        </FormRow>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Create organization
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
