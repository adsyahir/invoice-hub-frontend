import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormRow } from "@/components/common/FormRow";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

// No client-side schema — the backend is the single source of validation.
type Values = { email: string; password: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      // POST /auth/login
      const data = await api.auth.login(values.email, values.password);
      setSession(data.user, data.token, data.tenant, data.permissions);
      navigate("/dashboard");
    } catch {
      toast.error("Login failed", {
        description: "Check your credentials and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your InvoiceHub workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRow label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@acme.com"
            {...register("email")}
          />
        </FormRow>

        <FormRow
          label={
            <div className="flex w-full items-center justify-between">
              <span>Password</span>
              <Link
                to="/forgot-password"
                className="text-xs font-normal text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          }
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
          />
        </FormRow>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            Keep me signed in
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to InvoiceHub?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an organization
        </Link>
      </p>
    </div>
  );
}
