"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";
import { SectionCard } from "@/components/ui/SectionCard";

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

export function SenderSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <SectionCard number="01" title="Your details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="sender.name" label="Your Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("sender.name")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.companyName" label="Company Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={120} {...register("sender.companyName")} />
          )}
        </FormField>
      </div>

      <FormField<Invoice> name="sender.address" label="Company Address" required>
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={3} maxLength={300} {...register("sender.address")} />
        )}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField<Invoice> name="sender.gstin" label="GSTIN" hint="Optional">
          {({ id }) => (
            <input id={id} className={`${inputBase} font-mono`} maxLength={15} placeholder="22AAAAA0000A1Z5" {...register("sender.gstin")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.email" label="Email" hint="Optional">
          {({ id }) => (
            <input id={id} type="email" className={inputBase} maxLength={120} {...register("sender.email")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.phone" label="Phone" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={30} {...register("sender.phone")} />
          )}
        </FormField>
      </div>
    </SectionCard>
  );
}
