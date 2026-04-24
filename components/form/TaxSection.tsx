"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";
import { SectionCard } from "@/components/ui/SectionCard";

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

export function TaxSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <SectionCard number="05" title="Tax">
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
              className={`${inputBase} font-mono tabular-nums`}
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
              className={`${inputBase} font-mono tabular-nums`}
              {...register("tax.sgstPercent", { valueAsNumber: true })}
            />
          )}
        </FormField>
      </div>

      <p className="text-xs text-ink/50 leading-relaxed">
        For inter-state transactions, use IGST instead (not supported in v1).
      </p>
    </SectionCard>
  );
}
