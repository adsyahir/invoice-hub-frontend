import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormRowProps {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + inline error/hint. Pairs with react-hook-form. */
export function FormRow({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormRowProps) {
  // When there's an error, flag the control as invalid so it picks up the
  // destructive border/ring (Input, Textarea, Combobox trigger all style
  // aria-invalid). Single child only — pass-through otherwise.
  const control =
    error && Children.count(children) === 1 && isValidElement(children)
      ? cloneElement(children as React.ReactElement<{ "aria-invalid"?: boolean }>, {
          "aria-invalid": true,
        })
      : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      {control}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
