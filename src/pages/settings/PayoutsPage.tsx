import { ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { PayoutsStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOpenPayoutsDashboard,
  usePayoutsAccount,
  useStartPayoutsOnboarding,
} from "@/lib/api/services/queries";

/**
 * The "finish it later" home for Stripe Connect. Registration sends tenants straight to
 * Stripe, but plenty skip it, get interrupted, or hit a verification hold — so the same
 * flow needs a stable URL.
 */
export default function PayoutsPage() {
  const account = usePayoutsAccount();
  const start = useStartPayoutsOnboarding();
  const openDashboard = useOpenPayoutsDashboard();

  const status = account.data?.status;
  const enabled = status === "ENABLED";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payouts"
        description="How you get paid. Card and FPX payments are processed by Stripe and settled to your bank account."
      />
      <SettingsNav />

      <Card>
        <CardHeader>
          <CardTitle>Stripe account</CardTitle>
          <CardDescription>
            {account.data === null
              ? "Card and FPX payments are handled by Stripe. This workspace isn’t connected to it."
              : enabled
                ? "Your account is verified and accepting payments."
                : "Payment links on your invoices stay disabled until Stripe finishes verifying your business."}
          </CardDescription>
          <CardAction>
            {account.isPending ? (
              <Skeleton className="h-5 w-32" />
            ) : account.data === null ? null : (
              <PayoutsStatusBadge status={status} />
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {account.isPending ? (
            <Skeleton className="h-9 w-48" />
          ) : account.data === null ? (
            // No /payouts endpoints (see payouts.get). Say so plainly — this is the
            // one screen an admin came to looking for it.
            <p className="text-sm text-muted-foreground">
              Online payments aren’t enabled on this deployment yet.
            </p>
          ) : (
            <>
              <dl className="grid gap-3 sm:grid-cols-3">
                <Fact label="Accept payments" value={account.data?.chargesEnabled} />
                <Fact label="Payouts to bank" value={account.data?.payoutsEnabled} />
                <Fact label="Details submitted" value={account.data?.detailsSubmitted} />
              </dl>

              {!!account.data?.requirements?.length && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm font-medium">Stripe still needs</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                    {account.data.requirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {enabled ? (
                  <Button
                    variant="outline"
                    onClick={() => openDashboard.mutate()}
                    disabled={openDashboard.isPending}
                  >
                    {openDashboard.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ExternalLink className="size-4" />
                    )}
                    Open Stripe dashboard
                  </Button>
                ) : (
                  <Button onClick={() => start.mutate()} disabled={start.isPending}>
                    {start.isPending && <Loader2 className="size-4 animate-spin" />}
                    {status === "NOT_STARTED"
                      ? "Set up payouts"
                      : "Continue on Stripe"}
                    <ArrowUpRight className="size-4" />
                  </Button>
                )}
              </div>

              {account.data?.stripeAccountId && (
                <p className="text-xs text-muted-foreground">
                  Connected account{" "}
                  <span className="font-mono">{account.data.stripeAccountId}</span>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ? "Enabled" : "Not yet"}</dd>
    </div>
  );
}
