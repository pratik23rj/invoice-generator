"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function MetaSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Invoice details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="meta.invoiceNumber" label="Invoice Number" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={40} {...register("meta.invoiceNumber")} />
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
    </section>
  );
}
