import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePayoutsAccount } from "@/lib/api/services/queries";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Reminder for the tenant who skipped Stripe onboarding at registration. Renders nothing
 * once payouts are enabled, or for non-admins — only an admin can complete the KYC, and
 * gating the query keeps a viewer's session from polling an endpoint it can't use.
 */
export function PayoutsSetupAlert() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "TENANT_ADMIN" || role === "SUPER_ADMIN";

  const account = usePayoutsAccount(isAdmin);
  const status = account.data?.status;

  if (!isAdmin || !status || status === "ENABLED") return null;

  const restricted = status === "RESTRICTED";

  return (
    <Alert variant={restricted ? "destructive" : undefined}>
      <Wallet />
      <AlertTitle>
        {restricted
          ? "Stripe needs more information"
          : status === "IN_PROGRESS"
            ? "Stripe is verifying your business"
            : "Finish setting up payouts"}
      </AlertTitle>
      <AlertDescription>
        {status === "IN_PROGRESS"
          ? "Your invoices can’t be paid online until Stripe approves your account."
          : "Your invoices are sent without a payment link until Stripe can verify your business."}
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" render={<Link to="/settings/payouts" />}>
          {status === "IN_PROGRESS" ? "View status" : "Set up payouts"}
        </Button>
      </AlertAction>
    </Alert>
  );
}
