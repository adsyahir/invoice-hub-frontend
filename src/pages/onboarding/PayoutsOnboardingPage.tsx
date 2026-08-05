import { useEffect, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  usePayoutsAccount,
  useStartPayoutsOnboarding,
} from "@/lib/api/services/queries";

/**
 * Step 4 of registration: hand the tenant to Stripe's hosted KYC form.
 *
 * The account already exists (the backend created it at registration), so there is no
 * "connect Stripe" decision here — only Stripe's requirement that the account holder
 * enter their own details. Hence the auto-redirect: the visible UI is the half-second
 * before the browser leaves, plus the fallback when the redirect fails.
 */
export default function PayoutsOnboardingPage() {
  const [params] = useSearchParams();
  const account = usePayoutsAccount();
  const start = useStartPayoutsOnboarding();

  // Without this, StrictMode's double-invoked effect mints two AccountLinks.
  const autoStarted = useRef(false);

  const status = account.data?.status;

  useEffect(() => {
    if (autoStarted.current) return;
    if (!status || status === "ENABLED") return;
    autoStarted.current = true;
    start.mutate();
  }, [status, start]);

  // Nothing to onboard: already enabled (bookmarked URL, or refresh_url landing here
  // after they finished elsewhere), or no payouts on this backend (see payouts.get).
  if (status === "ENABLED" || account.data === null) {
    return <Navigate to="/dashboard" replace />;
  }

  const failed = start.isError;
  const expired = params.get("refresh") === "1";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          One last step — get paid
        </h1>
        <p className="text-sm text-muted-foreground">
          Your workspace is ready. To accept card and FPX payments on your invoices,
          Stripe needs to verify your business.
        </p>
      </div>

      <Steps />

      {expired && !failed && (
        <Alert>
          <AlertTitle>That link expired</AlertTitle>
          <AlertDescription>
            Stripe links are single-use. We’re sending you a fresh one.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Verify your business with Stripe
          </CardTitle>
          <CardDescription>
            You’ll enter your business registration, a contact person and the bank
            account payouts should land in. Stripe collects this directly — InvoiceHub
            never sees or stores it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {account.isPending ? (
            <Skeleton className="h-9 w-full" />
          ) : failed ? (
            <>
              <Alert variant="destructive">
                <AlertTitle>Couldn’t reach Stripe</AlertTitle>
                <AlertDescription>
                  Nothing was lost — your workspace is set up. Try again, or finish this
                  later from Settings → Payouts.
                </AlertDescription>
              </Alert>
              <Button onClick={() => start.mutate()} disabled={start.isPending}>
                {start.isPending && <Loader2 className="size-4 animate-spin" />}
                Try again
              </Button>
            </>
          ) : (
            <Button onClick={() => start.mutate()} disabled={start.isPending}>
              {start.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Redirecting to Stripe…
                </>
              ) : (
                <>
                  Continue to Stripe
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Takes about 5 minutes. You can leave and come back — Stripe saves your
            progress.
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/dashboard" className="font-medium text-primary hover:underline">
          Skip for now
        </Link>{" "}
        — you can create invoices, but they won’t be payable online until this is done.
      </p>
    </div>
  );
}

/** The "you are here" rail. Steps 1–2 are already behind them. */
function Steps() {
  const steps = [
    { label: "Account created", done: true },
    { label: "Business details", done: true },
    { label: "Payment setup", done: false },
  ];

  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => (
        <li key={step.label} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
              step.done
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-primary text-primary-foreground",
            )}
          >
            {step.done ? <Check className="size-3" /> : i + 1}
          </span>
          <span
            className={cn(
              "truncate text-xs",
              step.done ? "text-muted-foreground" : "font-medium",
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
        </li>
      ))}
    </ol>
  );
}
