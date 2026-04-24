"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { InvoiceDocument } from "@/components/pdf/InvoiceDocument";
import { senderCache, invoiceDraft, invoiceCounter } from "@/lib/storage";
import { buildFreshDefaults } from "@/lib/defaults";

type Props = {
  onDownloadSuccess: () => void;
  onDownloadError: (message: string) => void;
  onReset: () => void;
};

export function ActionBar({ onDownloadSuccess, onDownloadError, onReset }: Props) {
  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
    reset,
  } = useFormContext<Invoice>();
  const [downloading, setDownloading] = useState(false);

  const generate = handleSubmit(async (data) => {
    setDownloading(true);
    try {
      const blob = await pdf(<InvoiceDocument invoice={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.meta.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      senderCache.write(data.sender);
      invoiceCounter.increment();
      invoiceDraft.clear();

      reset(buildFreshDefaults());
      onDownloadSuccess();
    } catch (err) {
      onDownloadError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDownloading(false);
    }
  });

  const disabled = !isValid || isSubmitting || downloading;

  return (
    <section className="flex items-center justify-between gap-3 pt-4">
      <p className="hidden sm:block text-xs text-ink/40 italic">
        Everything stays in your browser. No accounts, no uploads.
      </p>
      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={disabled}
          className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_4px_12px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_18px_rgba(37,99,235,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span>{downloading ? "Generating…" : "Generate PDF"}</span>
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
          >
            <path
              d="M3 7h8m0 0L7 3m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
