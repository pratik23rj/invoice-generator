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

  return (
    <section className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={generate}
        disabled={!isValid || isSubmitting || downloading}
        className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading ? "Generating…" : "Generate PDF"}
      </button>
    </section>
  );
}
