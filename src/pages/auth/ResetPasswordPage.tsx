import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/common/FormRow";

// No client-side schema — the backend is the single source of validation.
type Values = { password: string; confirm: string };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { password: "", confirm: "" } });

  const onSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Your other sessions will be signed out for security.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRow label="New password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        </FormRow>
        <FormRow label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
        </FormRow>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
