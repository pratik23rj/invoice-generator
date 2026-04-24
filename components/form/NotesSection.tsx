"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";
import { SectionCard } from "@/components/ui/SectionCard";

const inputBase =
  "w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition-colors focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

export function NotesSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <SectionCard number="06" title="Notes & terms">
      <FormField<Invoice> name="notes" label="Notes or payment terms" hint="Optional — appears on the PDF">
        {({ id }) => (
          <textarea
            id={id}
            className={inputBase}
            rows={4}
            maxLength={1000}
            placeholder="Payment due within 30 days. Bank details, terms & conditions…"
            {...register("notes")}
          />
        )}
      </FormField>
    </SectionCard>
  );
}
