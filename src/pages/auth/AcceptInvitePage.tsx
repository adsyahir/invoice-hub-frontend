import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormRow } from "@/components/common/FormRow";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

// No client-side schema — the backend is the single source of validation.
type Values = { fullName: string; password: string; confirm: string };

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  // In production these come from the invite token.
  const inviteToken = params.get("token") ?? undefined;
  const email = params.get("email") ?? "new.member@novosoft.dev";
  const org = params.get("org") ?? "Novosoft Sdn Bhd";
  const role = params.get("role") ?? "Accountant";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { fullName: "", password: "", confirm: "" },
  });

  const onSubmit = async (values: Values) => {
    clearErrors();
    setSubmitting(true);
    try {
      // POST /auth/accept-invite — sets password and joins the workspace.
      const data = await api.auth.acceptInvite({
        token: inviteToken,
        fullName: values.fullName,
        password: values.password,
      });
      setSession(data.user, data.token, data.tenant);
      navigate("/dashboard"); 
    } catch (err) {
      // Backend owns validation; map any field errors onto the form.
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
        toast.error("Couldn’t accept the invitation", {
          description: "The link may have expired. Ask for a new invite.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Join {org}
        </h1>
        <p className="text-sm text-muted-foreground">
          You’ve been invited as <Badge variant="secondary">{role}</Badge> using{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRow label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" placeholder="Your name" {...register("fullName")} />
        </FormRow>
        <FormRow label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        </FormRow>
        <FormRow label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
        </FormRow>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Accept invitation
        </Button>
      </form>
    </div>
  );
}
