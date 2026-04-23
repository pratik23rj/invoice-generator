"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceSchema, type Invoice } from "@/lib/schema";
import { buildInitialDefaults, buildFreshDefaults } from "@/lib/defaults";
import { SenderSection } from "./form/SenderSection";
import { ClientSection } from "./form/ClientSection";
import { MetaSection } from "./form/MetaSection";
import { LineItemsTable } from "./form/LineItemsTable";
import { TaxSection } from "./form/TaxSection";

export function InvoicePage() {
  const [mounted, setMounted] = useState(false);
  const methods = useForm<Invoice>({
    resolver: zodResolver(InvoiceSchema),
    mode: "onChange",
    defaultValues: buildFreshDefaults(),
  });

  // After hydration, replace SSR-safe defaults with localStorage-aware ones.
  useEffect(() => {
    methods.reset(buildInitialDefaults());
    setMounted(true);
  }, [methods]);

  if (!mounted) {
    return (
      <main className="p-8 text-slate-600">Loading…</main>
    );
  }

  return (
    <FormProvider {...methods}>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <section aria-label="Invoice form" className="space-y-6">
            <h1 className="text-2xl font-semibold">Invoice</h1>
            <SenderSection />
            <ClientSection />
            <MetaSection />
            <LineItemsTable />
            <TaxSection />
          </section>
          <aside aria-label="PDF preview" className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="bg-white border border-slate-200 rounded-lg h-full flex items-center justify-center text-slate-400">
              Preview appears here
            </div>
          </aside>
        </div>
      </main>
    </FormProvider>
  );
}
