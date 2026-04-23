"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { useDebounced } from "@/lib/useDebounced";
import { invoiceDraft } from "@/lib/storage";

export function DraftAutosave() {
  const { control } = useFormContext<Invoice>();
  const value = useWatch({ control }) as Invoice | undefined;
  const debounced = useDebounced(value, 2000);

  useEffect(() => {
    if (!debounced) return;
    invoiceDraft.write(debounced);
  }, [debounced]);

  return null;
}
