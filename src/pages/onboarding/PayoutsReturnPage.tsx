import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  usePayoutsAccount,
  useStartPayoutsOnboarding,
} from "@/lib/api/services/queries";

/** How long to wait on the webhook before telling them to carry on with their day. */
const POLL_TIMEOUT_MS = 20_000;

/**
 * Where Stripe drops the tenant after the hosted form.
 *
 * The redirect proves nothing — Stripe sends them here whether they finished or bailed,
 * and a completed form only becomes `charges_enabled` once the webhook lands. So this
 * page polls our own API instead. Verification can take hours, hence the timeout: a
 * spinner that never resolves is worse than an honest "we'll let you know".
 */
export default function PayoutsReturnPage() {
  const navigate = useNavigate();
  const account = usePayoutsAccount();
  const start = useStartPayoutsOnboarding();
  const [timedOut, setTimedOut] = useState(false);

  const status = account.data?.status;
  const settled = status === "ENABLED" || status === "RESTRICTED";

  useEffect(() => {
    if (settled) return;
    const t = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [settled]);

  // No payouts on this deployment — nothing to confirm (see payouts.get).
  if (account.data === null) return <Navigate to="/dashboard" replace />;

  if (status === "ENABLED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            You’re ready to get paid
          </CardTitle>
          <CardDescription>
            Stripe verified your business. Every invoice you send now carries a payment
            link, and the money lands in your bank account on Stripe’s payout schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/dashboard", { replace: true })}>
            Go to dashboard
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "RESTRICTED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
            Stripe needs a bit more
          </CardTitle>
          <CardDescription>
            {account.data?.disabledReason ??
              "Some required details are missing or couldn’t be verified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!!account.data?.requirements?.length && (
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {account.data.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button onClick={() => start.mutate()} disabled={start.isPending}>
              {start.isPending && <Loader2 className="size-4 animate-spin" />}
              Continue on Stripe
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Do this later
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timedOut) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stripe is still reviewing</CardTitle>
          <CardDescription>
            This can take a few minutes, occasionally longer. Nothing more is needed from
            you — we’ll notify you the moment your account is approved, and you can track
            it under Settings → Payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => navigate("/dashboard", { replace: true })}>
            Go to dashboard
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" render={<Link to="/settings/payouts" />}>
            View payout status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          Confirming with Stripe…
        </CardTitle>
        <CardDescription>
          Hang on a moment while we check that your account is fully set up.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
