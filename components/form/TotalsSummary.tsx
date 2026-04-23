"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { computeTotals } from "@/lib/calculations";
import { formatRupees } from "@/lib/indianNumber";
import { rupeesInWords } from "@/lib/numberToWords";

export function TotalsSummary() {
  const { control } = useFormContext<Invoice>();
  const lineItems = useWatch({ control, name: "lineItems" }) ?? [];
  const tax = useWatch({ control, name: "tax" }) ?? { cgstPercent: 0, sgstPercent: 0 };

  // Filter out rows with NaN numeric fields to stay safe during typing.
  const safeItems = lineItems.filter(
    (i) => typeof i?.quantity === "number" && typeof i?.rate === "number"
  );
  const totals = computeTotals(safeItems as Invoice["lineItems"], tax);

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <h2 className="text-lg font-semibold">Totals</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="tabular-nums">{formatRupees(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">CGST ({tax.cgstPercent}%)</dt>
          <dd className="tabular-nums">{formatRupees(totals.cgstAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">SGST ({tax.sgstPercent}%)</dt>
          <dd className="tabular-nums">{formatRupees(totals.sgstAmount)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2">
          <dt className="font-semibold">Grand Total</dt>
          <dd className="font-semibold tabular-nums">{formatRupees(totals.grandTotal)}</dd>
        </div>
      </dl>

      <p className="text-xs italic text-slate-600">{rupeesInWords(totals.grandTotal)}</p>

      {totals.grandTotal === 0 ? (
        <p className="text-xs text-amber-600">Grand total is ₹0.00 — you can still download.</p>
      ) : null}
    </section>
  );
}
