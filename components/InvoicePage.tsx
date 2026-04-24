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
import { NotesSection } from "./form/NotesSection";
import { TotalsSummary } from "./form/TotalsSummary";
import { ActionBar } from "./form/ActionBar";
import { ConfirmDialog } from "./form/ConfirmDialog";
import { DraftAutosave } from "./form/DraftAutosave";
import { PdfPreview } from "./pdf/PdfPreview";
import { StorageBanner } from "./ui/StorageBanner";
import { Toast } from "./ui/Toast";
import { invoiceDraft } from "@/lib/storage";

export function InvoicePage() {
  const [mounted, setMounted] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);
  const methods = useForm<Invoice>({
    resolver: zodResolver(InvoiceSchema),
    mode: "onChange",
    defaultValues: buildFreshDefaults(),
  });

  const handleResetConfirmed = () => {
    methods.reset(buildFreshDefaults());
    invoiceDraft.clear();
    setConfirmResetOpen(false);
  };

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
    <>
      <StorageBanner />
      <FormProvider {...methods}>
      <DraftAutosave />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-24">
          <section aria-label="Invoice form" className="space-y-6">
            <h1 className="text-2xl font-semibold">Invoice</h1>
            <SenderSection />
            <ClientSection />
            <MetaSection />
            <LineItemsTable />
            <TaxSection />
            <NotesSection />
            <TotalsSummary />
            <ActionBar
              onDownloadSuccess={() => setToast({ msg: "PDF downloaded.", variant: "success" })}
              onDownloadError={(msg) => setToast({ msg: `PDF generation failed: ${msg}`, variant: "error" })}
              onReset={() => setConfirmResetOpen(true)}
            />
          </section>
          <aside
            aria-label="PDF preview"
            className="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"
          >
            <PdfPreview />
          </aside>
        </div>
      </main>
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 px-4 py-2 rounded-full bg-slate-900 text-white text-sm shadow-lg"
      >
        Preview
      </button>
      {mobilePreviewOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <span className="text-sm font-medium">Preview</span>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="text-slate-600"
              aria-label="Close preview"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0 p-3">
            <PdfPreview />
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset invoice?"
        description="This clears the client, line items, notes, and generates a new invoice number. Your sender details are preserved."
        confirmLabel="Reset"
        onConfirm={handleResetConfirmed}
        onCancel={() => setConfirmResetOpen(false)}
      />
      <Toast
        message={toast?.msg ?? null}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />
      </FormProvider>
    </>
  );
}
