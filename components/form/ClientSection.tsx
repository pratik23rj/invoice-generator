"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";
import { SectionCard } from "@/components/ui/SectionCard";

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

export function ClientSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <SectionCard number="02" title="Bill to">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="client.name" label="Client Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("client.name")} />
          )}
        </FormField>
        <FormField<Invoice> name="client.companyName" label="Client Company" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={120} {...register("client.companyName")} />
          )}
        </FormField>
      </div>

      <FormField<Invoice> name="client.address" label="Client Address" required>
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={3} maxLength={300} {...register("client.address")} />
        )}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="client.gstin" label="Client GSTIN" hint="Optional">
          {({ id }) => (
            <input id={id} className={`${inputBase} font-mono`} maxLength={15} {...register("client.gstin")} />
          )}
        </FormField>
        <FormField<Invoice> name="client.email" label="Client Email" hint="Optional">
          {({ id }) => (
            <input id={id} type="email" className={inputBase} maxLength={120} {...register("client.email")} />
          )}
        </FormField>
      </div>
    </SectionCard>
  );
}
