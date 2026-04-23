"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function SenderSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Your details</h2>

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
            <input id={id} className={inputBase} maxLength={15} placeholder="22AAAAA0000A1Z5" {...register("sender.gstin")} />
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
    </section>
  );
}
