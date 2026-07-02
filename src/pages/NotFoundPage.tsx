import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex flex-col gap-2">
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="text-muted-foreground">
          We couldn’t find the page you were looking for.
        </p>
      </div>
      <Button render={<Link to="/dashboard" />}>Back to dashboard</Button>
    </div>
  );
}
