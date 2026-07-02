import { format, formatDistanceToNow, parseISO } from "date-fns";
import type { CurrencyCode } from "@/types";

/** Format a numeric amount as currency. Defaults to MYR (per the doc). */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "MYR",
): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact number, e.g. 12,500 -> "12.5K" (used in stat deltas/charts). */
export function formatCompact(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

/** e.g. "13 Jun 2026" */
export function formatDate(value: string | Date): string {
  return format(toDate(value), "dd MMM yyyy");
}

/** e.g. "13 Jun 2026, 5:42 PM" */
export function formatDateTime(value: string | Date): string {
  return format(toDate(value), "dd MMM yyyy, h:mm a");
}

/** e.g. "3 days ago" */
export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(toDate(value), { addSuffix: true });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Whole-number percent for tax rates etc. */
export function formatRate(value: number): string {
  return `${value}%`;
}
