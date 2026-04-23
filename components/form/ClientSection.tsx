"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function ClientSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Bill to</h2>

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
            <input id={id} className={inputBase} maxLength={15} {...register("client.gstin")} />
          )}
        </FormField>
        <FormField<Invoice> name="client.email" label="Client Email" hint="Optional">
          {({ id }) => (
            <input id={id} type="email" className={inputBase} maxLength={120} {...register("client.email")} />
          )}
        </FormField>
      </div>
    </section>
  );
}
