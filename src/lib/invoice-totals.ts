export interface RawLineItem {
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute invoice totals from line items + discount.
 *
 * NOTE: This is for live display only. Per the spec, the backend is the source
 * of truth for amounts — re-compute and validate server-side on submit.
 */
export function computeInvoiceTotals(
  lineItems: RawLineItem[],
  discount = 0,
): InvoiceTotals {
  let subtotal = 0;
  let taxAmount = 0;
  for (const li of lineItems) {
    const qty = Number(li.quantity) || 0;
    const price = Number(li.unitPrice) || 0;
    const rate = Number(li.taxRate) || 0;
    const base = qty * price;
    subtotal += base;
    taxAmount += (base * rate) / 100;
  }
  const total = subtotal + taxAmount - (Number(discount) || 0);
  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    total: round2(Math.max(0, total)),
  };
}

export function lineTotal(li: RawLineItem): number {
  const base = (Number(li.quantity) || 0) * (Number(li.unitPrice) || 0);
  return round2(base + (base * (Number(li.taxRate) || 0)) / 100);
}
