import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/common/FormRow";

// No client-side schema — the backend is the single source of validation.
type Values = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { email: "" } });

  const onSubmit = (values: Values) => {
    setSubmitting(true);
    setTimeout(() => {
      setSent(values.email);
      setSubmitting(false);
    }, 600);
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{sent}</span>,
            we’ve sent a reset link. It expires in 1 hour.
          </p>
        </div>
        <Button variant="outline" className="w-full" render={<Link to="/login" />}>
          <ArrowLeft className="size-4" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRow label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
        </FormRow>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
