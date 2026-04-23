"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function NotesSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Notes / Terms</h2>

      <FormField<Invoice> name="notes" label="Notes or payment terms" hint="Optional — appears on the PDF">
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={4} maxLength={1000} {...register("notes")} />
        )}
      </FormField>
    </section>
  );
}
