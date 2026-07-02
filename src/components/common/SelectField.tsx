import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Thin wrapper over the base-ui Select that maps option values to labels
 * (via the root `items` prop) so the trigger shows readable text.
 */
export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  id,
  disabled,
}: SelectFieldProps) {
  const items = options.reduce<Record<string, ReactNode>>((acc, o) => {
    acc[o.value] = o.label;
    return acc;
  }, {});

  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange?.(v as string)}
      items={items}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
