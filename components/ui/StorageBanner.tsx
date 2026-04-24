"use client";

import { useEffect, useState } from "react";
import { isStorageAvailable } from "@/lib/storage";

export function StorageBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isStorageAvailable());
  }, []);

  if (!show) return null;

  return (
    <div className="bg-ink text-paper px-6 py-2.5 flex items-center justify-between text-xs">
      <span className="flex items-center gap-2">
        <span className="font-mono tracking-[0.2em] uppercase text-paper/50">Heads up</span>
        <span className="text-paper/90">
          Drafts can't be saved in this browser session — localStorage is unavailable.
        </span>
      </span>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="ml-4 h-6 w-6 inline-flex items-center justify-center rounded-full text-paper/60 hover:text-paper hover:bg-paper/10 transition-colors"
        aria-label="Dismiss"
      >
        <span className="text-base leading-none">×</span>
      </button>
    </div>
  );
}
