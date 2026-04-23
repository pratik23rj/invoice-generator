import type { Invoice } from "./schema";

/**
 * Round half to even (banker's rounding) to 2 decimals.
 * Uses a small epsilon to account for IEEE-754 representation of *.xx5 values
 * (e.g., 2.135 * 100 = 213.49999…). Assumes non-negative input; not validated
 * because the schema constrains upstream inputs.
 */
export function bankersRound(value: number): number {
  const EPSILON = 1e-9;
  const scaled = value * 100;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;

  if (diff > 0.5 + EPSILON) return (floor + 1) / 100;
  if (diff < 0.5 - EPSILON) return floor / 100;
  // within epsilon of 0.5: round to even
  return (floor % 2 === 0 ? floor : floor + 1) / 100;
}

export type Totals = {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
};

/**
 * Sums per-line rounded amounts (so displayed line amounts always add up to
 * subtotal), applies CGST/SGST percentages, and rounds each monetary value.
 */
export function computeTotals(
  lineItems: Invoice["lineItems"],
  tax: Invoice["tax"]
): Totals {
  const subtotal = bankersRound(
    lineItems.reduce((sum, item) => sum + lineAmount(item), 0)
  );
  const cgstAmount = bankersRound((subtotal * tax.cgstPercent) / 100);
  const sgstAmount = bankersRound((subtotal * tax.sgstPercent) / 100);
  const grandTotal = bankersRound(subtotal + cgstAmount + sgstAmount);
  return { subtotal, cgstAmount, sgstAmount, grandTotal };
}

export function lineAmount(item: { quantity: number; rate: number }): number {
  return bankersRound(item.quantity * item.rate);
}
