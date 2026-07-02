import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/lib/api/services/queries";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { data: plans, isLoading } = usePlans();
  const tenant = useAuthStore((s) => s.tenant);
  const currentPlan = tenant?.plan ?? "PROFESSIONAL";

  return (
    <>
      <PageHeader title="Settings" description="Manage your organization." />
      <SettingsNav />

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            You’re on the{" "}
            <span className="font-medium text-foreground capitalize">
              {currentPlan.toLowerCase()}
            </span>{" "}
            plan. {tenant?.invoicesThisMonth ?? 0} invoices used this month.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))
          : (plans ?? []).map((plan) => {
              const isCurrent = plan.name === currentPlan;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "flex flex-col",
                    isCurrent && "border-primary ring-1 ring-primary",
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {plan.name.toLowerCase()}
                      </CardTitle>
                      {isCurrent && <Badge variant="secondary">Current</Badge>}
                    </div>
                    <div className="pt-2">
                      <span className="text-3xl font-semibold tabular-nums">
                        {plan.priceMonthly === 0
                          ? "Free"
                          : formatCurrency(plan.priceMonthly, "USD")}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-sm text-muted-foreground">/mo</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <ul className="flex flex-1 flex-col gap-2 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent}
                      onClick={() =>
                        toast.success(`Switching to ${plan.name.toLowerCase()} plan`)
                      }
                    >
                      {isCurrent ? "Current plan" : "Choose plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </>
  );
}
