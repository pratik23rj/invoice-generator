"use client";

import dynamic from "next/dynamic";
import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { useDebounced } from "@/lib/useDebounced";
import { InvoiceDocument } from "./InvoiceDocument";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <LoadingPanel label="Preparing preview…" /> }
);

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400">
      {label}
    </div>
  );
}

export function PdfPreview() {
  const { control, getValues } = useFormContext<Invoice>();
  const liveInvoice = useWatch({ control }) as Invoice | undefined;
  const debounced = useDebounced(liveInvoice ?? getValues(), 300);

  return (
    <div className="h-full w-full">
      <PDFViewer
        className="h-full w-full border border-slate-200 rounded-lg bg-white"
        showToolbar={false}
      >
        <InvoiceDocument invoice={debounced as Invoice} />
      </PDFViewer>
    </div>
  );
}
