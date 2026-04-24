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

function Masthead() {
  return (
    <header className="border-b border-ink/15 pb-7 mb-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-ink/50 mb-3">
            Tax invoice · India
          </p>
          <h1 className="font-display text-6xl md:text-7xl leading-[0.95] text-ink">
            Invoice<span className="text-blue-600">.</span>
          </h1>
          <p className="font-display italic text-lg text-ink/60 mt-2">
            Compose, preview, and send in under a minute.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 pt-2">
          <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink/40">
            v1 · GST
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-ink/40">
            Client-side only
          </span>
        </div>
      </div>
    </header>
  );
}

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

  useEffect(() => {
    methods.reset(buildInitialDefaults());
    setMounted(true);
  }, [methods]);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-display italic text-xl text-ink/50">Loading…</p>
      </main>
    );
  }

  return (
    <>
      <StorageBanner />
      <FormProvider {...methods}>
        <DraftAutosave />
        <main className="min-h-screen">
          <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-10 px-6 md:px-10 py-8 md:py-12 pb-24">
            <section aria-label="Invoice form" className="space-y-6 min-w-0">
              <Masthead />
              <SenderSection />
              <ClientSection />
              <MetaSection />
              <LineItemsTable />
              <TaxSection />
              <NotesSection />
              <TotalsSummary />
              <ActionBar
                onDownloadSuccess={() => setToast({ msg: "PDF downloaded.", variant: "success" })}
                onDownloadError={(msg) =>
                  setToast({ msg: `PDF generation failed: ${msg}`, variant: "error" })
                }
                onReset={() => setConfirmResetOpen(true)}
              />
              <footer className="pt-8 mt-8 border-t border-ink/10 flex items-center justify-between text-xs text-ink/40">
                <span className="font-mono tracking-wider uppercase">
                  Made with care · Mumbai
                </span>
                <span className="font-display italic">— fin —</span>
              </footer>
            </section>
            <aside
              aria-label="PDF preview"
              className="hidden lg:flex flex-col lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/50">
                  Live preview
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-ink/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" aria-hidden />
                  WYSIWYG
                </span>
              </div>
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-ink/10 shadow-card bg-white">
                <PdfPreview />
              </div>
            </aside>
          </div>
        </main>
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="lg:hidden fixed bottom-5 right-5 px-5 py-3 rounded-full bg-ink text-paper text-sm font-medium shadow-lg hover:bg-ink/90 transition-colors"
        >
          Preview
        </button>
        {mobilePreviewOpen ? (
          <div className="lg:hidden fixed inset-0 z-40 bg-paper flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/50">
                  Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink/60 hover:bg-ink/5"
                aria-label="Close preview"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4">
              <div className="h-full rounded-xl overflow-hidden border border-ink/10 bg-white">
                <PdfPreview />
              </div>
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
