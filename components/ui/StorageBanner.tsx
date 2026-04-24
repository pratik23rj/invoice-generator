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
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm text-amber-800">
      <span>
        Drafts and sender details can't be saved in this browser session (localStorage unavailable).
      </span>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="ml-4 text-amber-800 hover:text-amber-900"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
