"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { computeTotals } from "@/lib/calculations";
import { formatRupees, formatIndianNumber } from "@/lib/indianNumber";
import { rupeesInWords } from "@/lib/numberToWords";

export function TotalsSummary() {
  const { control } = useFormContext<Invoice>();
  const lineItems = useWatch({ control, name: "lineItems" }) ?? [];
  const tax = useWatch({ control, name: "tax" }) ?? { cgstPercent: 0, sgstPercent: 0 };

  const safeItems = lineItems.filter(
    (i) =>
      typeof i?.quantity === "number" &&
      Number.isFinite(i.quantity) &&
      typeof i?.rate === "number" &&
      Number.isFinite(i.rate)
  );
  const totals = computeTotals(safeItems as Invoice["lineItems"], tax);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ink text-paper p-7 md:p-9 shadow-card">
      {/* decorative accent bar */}
      <div className="absolute top-0 right-0 h-full w-1 bg-blue-600" aria-hidden />

      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-paper/40">
          07
        </span>
        <h2 className="font-display text-[1.75rem] leading-none text-paper">Total due</h2>
      </div>

      <dl className="space-y-2.5 text-sm border-b border-paper/10 pb-5 mb-5">
        <div className="flex justify-between items-baseline">
          <dt className="text-paper/60">Subtotal</dt>
          <dd className="tabular-nums font-mono text-paper">{formatRupees(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="text-paper/60">
            CGST <span className="font-mono text-paper/40">· {tax.cgstPercent}%</span>
          </dt>
          <dd className="tabular-nums font-mono text-paper">{formatRupees(totals.cgstAmount)}</dd>
        </div>
        <div className="flex justify-between items-baseline">
          <dt className="text-paper/60">
            SGST <span className="font-mono text-paper/40">· {tax.sgstPercent}%</span>
          </dt>
          <dd className="tabular-nums font-mono text-paper">{formatRupees(totals.sgstAmount)}</dd>
        </div>
      </dl>

      <div className="flex items-end justify-between gap-4 mb-5">
        <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-paper/50 pb-2">
          Grand total
        </span>
        <div className="text-right">
          <span className="font-display text-5xl md:text-6xl leading-none tabular-nums text-paper">
            <span className="text-paper/40 text-3xl md:text-4xl mr-1 align-top">₹</span>
            {formatIndianNumber(totals.grandTotal)}
          </span>
        </div>
      </div>

      <p className="font-display italic text-base leading-snug text-paper/70 border-t border-paper/10 pt-4">
        {rupeesInWords(totals.grandTotal)}
      </p>

      {totals.grandTotal === 0 ? (
        <p className="mt-4 text-xs text-amber-300/90">
          Grand total is ₹0.00 — you can still download.
        </p>
      ) : null}
    </section>
  );
}
