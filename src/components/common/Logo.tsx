import { cn } from "@/lib/utils";

/** Wordmark + monogram. Restrained, no gradients. */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="text-sm font-semibold tracking-tight">IH</span>
      </div>
      {showText && (
        <span className="text-[15px] font-semibold tracking-tight">
          InvoiceHub
        </span>
      )}
    </div>
  );
}
