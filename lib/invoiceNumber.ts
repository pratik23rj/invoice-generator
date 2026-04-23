import { invoiceCounter } from "./storage";

function todayCompact(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Build the NEXT invoice number string (does not mutate the counter). */
export function nextInvoiceNumber(date = new Date()): string {
  const nextCount = invoiceCounter.read() + 1;
  const padded = String(nextCount).padStart(3, "0");
  return `INV-${todayCompact(date)}-${padded}`;
}

/** Convert today's Date to ISO-yyyy-mm-dd for form defaults. */
export function todayIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO date N days after the given date (for 30-day default due date). */
export function isoDatePlusDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return todayIso(d);
}
