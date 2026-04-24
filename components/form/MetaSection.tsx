"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";
import { SectionCard } from "@/components/ui/SectionCard";

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

export function MetaSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <SectionCard number="03" title="Invoice details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="meta.invoiceNumber" label="Invoice Number" required>
          {({ id }) => (
            <input id={id} className={`${inputBase} font-mono`} maxLength={40} {...register("meta.invoiceNumber")} />
          )}
        </FormField>
        <FormField<Invoice> name="meta.placeOfSupply" label="Place of Supply" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("meta.placeOfSupply")} />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="meta.invoiceDate" label="Invoice Date" required>
          {({ id }) => (
            <input id={id} type="date" className={inputBase} {...register("meta.invoiceDate")} />
          )}
        </FormField>
        <FormField<Invoice> name="meta.dueDate" label="Due Date" hint="Optional (defaults to +30 days)">
          {({ id }) => (
            <input id={id} type="date" className={inputBase} {...register("meta.dueDate")} />
          )}
        </FormField>
      </div>
    </SectionCard>
  );
}
