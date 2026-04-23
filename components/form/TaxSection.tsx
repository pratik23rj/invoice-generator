"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function TaxSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Tax</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="tax.cgstPercent" label="CGST %" required>
          {({ id }) => (
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="28"
              className={inputBase}
              {...register("tax.cgstPercent", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField<Invoice> name="tax.sgstPercent" label="SGST %" required>
          {({ id }) => (
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="28"
              className={inputBase}
              {...register("tax.sgstPercent", { valueAsNumber: true })}
            />
          )}
        </FormField>
      </div>

      <p className="text-xs text-slate-500">
        For inter-state transactions, use IGST instead (not supported in v1).
      </p>
    </section>
  );
}
