import type { Invoice } from "./schema";

/**
 * Banker's rounding (round half to even) to 2 decimals.
 * Avoids upward bias across many small rounded amounts.
 */
export function bankersRound(value: number): number {
  const scaled = value * 100;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;

  if (diff > 0.5) return (floor + 1) / 100;
  if (diff < 0.5) return floor / 100;
  // diff === 0.5: round to even
  return (floor % 2 === 0 ? floor : floor + 1) / 100;
}

export type Totals = {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
};

export function computeTotals(
  lineItems: Invoice["lineItems"],
  tax: Invoice["tax"]
): Totals {
  const subtotal = bankersRound(
    lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  );
  const cgstAmount = bankersRound((subtotal * tax.cgstPercent) / 100);
  const sgstAmount = bankersRound((subtotal * tax.sgstPercent) / 100);
  const grandTotal = bankersRound(subtotal + cgstAmount + sgstAmount);
  return { subtotal, cgstAmount, sgstAmount, grandTotal };
}

export function lineAmount(item: { quantity: number; rate: number }): number {
  return bankersRound(item.quantity * item.rate);
}
