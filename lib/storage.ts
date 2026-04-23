import type { Invoice, Sender } from "./schema";

const KEYS = {
  senderCache: "invgen:sender_cache",
  draft: "invgen:invoice_draft",
  counter: "invgen:invoice_counter",
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/** Detect whether localStorage is usable (for the "drafts won't save" banner). */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__invgen_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const senderCache = {
  read: () => safeGet<Sender>(KEYS.senderCache),
  write: (value: Sender) => safeSet(KEYS.senderCache, value),
  clear: () => safeRemove(KEYS.senderCache),
};

export const invoiceDraft = {
  read: () => safeGet<Invoice>(KEYS.draft),
  write: (value: Invoice) => safeSet(KEYS.draft, value),
  clear: () => safeRemove(KEYS.draft),
};

export const invoiceCounter = {
  read: (): number => safeGet<number>(KEYS.counter) ?? 0,
  write: (value: number) => safeSet(KEYS.counter, value),
  increment: (): number => {
    const current = invoiceCounter.read();
    const next = current + 1;
    invoiceCounter.write(next);
    return next;
  },
};
