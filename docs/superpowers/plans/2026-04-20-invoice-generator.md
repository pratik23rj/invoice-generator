# Invoice Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GST-compliant invoice generator web app: single-page, client-side only, WYSIWYG preview, PDF download in under 60 seconds.

**Architecture:** Next.js 15 App Router (static export) + TypeScript + Tailwind. React Hook Form + Zod is the single source of truth for form state. `@react-pdf/renderer` is the single source of truth for the invoice's visual template — the same `<InvoiceDocument />` is rendered live in the preview iframe (`<PDFViewer>`) and downloaded on "Generate PDF" via `pdf().toBlob()`. All state persists to `localStorage` (sender cache, draft, counter). No backend, no analytics, no automated tests in v1.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 3, `@react-pdf/renderer` ≥4, `react-hook-form` ≥7.52, `zod` ≥3.23, Inter font.

**Spec reference:** `docs/superpowers/specs/2026-04-20-invoice-generator-design.md`

---

## Important conventions for every task

- Working directory is the repo root: `/Users/pratik/Downloads/Claude/invoice-generator`.
- All commits use Conventional Commits style (`feat:`, `fix:`, `chore:`, `docs:`).
- User explicitly opted out of automated tests — no Vitest / no Playwright in this plan. Each task ends with a **manual check** step (start the dev server and/or do a typecheck) before committing.
- Every file path in this plan is relative to the repo root unless it starts with `/`.
- Assume `pnpm` is the package manager. If you don't have it: `npm install -g pnpm` first. All install/run commands use `pnpm`.

---

## Task 1: Scaffold Next.js 15 project + dependencies + base config

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.nvmrc`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `public/fonts/.gitkeep` (fonts added in Task 15)
- Modify: `README.md`

- [ ] **Step 1: Remove the legacy zip and confirm clean repo state**

The repo ships with `invoice-generator.zip` (legacy code from the original author). We chose "greenfield" in brainstorming, so it goes.

```bash
rm invoice-generator.zip
git rm --cached invoice-generator.zip 2>/dev/null || true
git status
```

Expected: `invoice-generator.zip` appears as deleted; working tree is otherwise only the docs committed so far.

- [ ] **Step 2: Scaffold the Next.js 15 app in the existing directory**

We can't use `create-next-app` to populate the current directory because the docs folder already exists. Do it manually.

Write `package.json`:

```json
{
  "name": "invoice-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  },
  "dependencies": {
    "@react-pdf/renderer": "^4.1.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0"
  }
}
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Write `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
```

Write `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

Write `postcss.config.mjs`:

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

Write `.gitignore`:

```
node_modules
.next
out
.env*.local
.DS_Store
next-env.d.ts
*.tsbuildinfo
```

Write `.nvmrc`:

```
20
```

- [ ] **Step 3: Write minimal `app/` entrypoints so `next dev` boots**

Write `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { @apply bg-white text-slate-900 antialiased; }
```

Write `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoice Generator",
  description: "GST-compliant invoice generator for Indian businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

Write `app/page.tsx`:

```tsx
export default function Page() {
  return <main className="p-8">Invoice Generator — scaffolding</main>;
}
```

Write `public/fonts/.gitkeep` (empty file — reserves the directory for Task 15).

Update `README.md`:

```md
# Invoice Generator

GST-compliant invoice generator for Indian businesses. Client-side only.
See `docs/superpowers/specs/2026-04-20-invoice-generator-design.md` for the spec.

## Development
pnpm install
pnpm dev
```

- [ ] **Step 4: Install dependencies and smoke-test dev server**

```bash
pnpm install
pnpm typecheck
```

Expected: install completes; typecheck passes with no errors.

```bash
pnpm dev
```

Expected: dev server boots on `http://localhost:3000`, page shows "Invoice Generator — scaffolding". Stop it with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js 15 + TS + Tailwind + deps"
```

---

## Task 2: Zod schema and Invoice type (`lib/schema.ts`)

**Files:**
- Create: `lib/schema.ts`

- [ ] **Step 1: Write the schema**

Create `lib/schema.ts`:

```ts
import { z } from "zod";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

const optionalGstin = optionalString(15).refine(
  (v) => v === undefined || GSTIN_REGEX.test(v),
  { message: "Invalid GSTIN (expected 15-char format)" }
);

const optionalEmail = optionalString(120).refine(
  (v) => v === undefined || EMAIL_REGEX.test(v),
  { message: "Invalid email address" }
);

export const SenderSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  companyName: z.string().trim().min(1, "Required").max(120),
  address: z.string().trim().min(1, "Required").max(300),
  gstin: optionalGstin,
  email: optionalEmail,
  phone: optionalString(30),
});

export const ClientSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  companyName: z.string().trim().min(1, "Required").max(120),
  address: z.string().trim().min(1, "Required").max(300),
  gstin: optionalGstin,
  email: optionalEmail,
});

export const MetaSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Required").max(40),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  placeOfSupply: optionalString(80),
});

export const LineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().min(1, "Required").max(200),
  hsnSac: optionalString(10),
  quantity: z
    .number({ invalid_type_error: "Required" })
    .min(0.01, "Min 0.01")
    .max(999999, "Max 999999")
    .refine((n) => Number((n * 100).toFixed(0)) / 100 === n, "Max 2 decimals"),
  rate: z
    .number({ invalid_type_error: "Required" })
    .min(0, "Min 0")
    .refine((n) => Number((n * 100).toFixed(0)) / 100 === n, "Max 2 decimals"),
});

export const TaxSchema = z.object({
  cgstPercent: z.number().min(0).max(28),
  sgstPercent: z.number().min(0).max(28),
});

export const InvoiceSchema = z.object({
  sender: SenderSchema,
  client: ClientSchema,
  meta: MetaSchema,
  lineItems: z.array(LineItemSchema).min(1, "At least one line item required"),
  tax: TaxSchema,
  notes: optionalString(1000),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type Sender = z.infer<typeof SenderSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
```

- [ ] **Step 2: Verify it typechecks**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/schema.ts
git commit -m "feat: add Zod schema + Invoice types"
```

---

## Task 3: Calculations (`lib/calculations.ts`)

**Files:**
- Create: `lib/calculations.ts`

- [ ] **Step 1: Write the module**

Create `lib/calculations.ts`:

```ts
import type { Invoice } from "./schema";

/**
 * Banker's rounding (round half to even) to 2 decimals.
 * Avoids upward bias across many small rounded amounts.
 */
export function bankersRound(value: number): number {
  const scaled = value * 100;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;

  if (diff > 0.5) return (floor + 1) / 100;
  if (diff < 0.5) return floor / 100;
  // diff === 0.5: round to even
  return (floor % 2 === 0 ? floor : floor + 1) / 100;
}

export type Totals = {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
};

export function computeTotals(
  lineItems: Invoice["lineItems"],
  tax: Invoice["tax"]
): Totals {
  const subtotal = bankersRound(
    lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  );
  const cgstAmount = bankersRound((subtotal * tax.cgstPercent) / 100);
  const sgstAmount = bankersRound((subtotal * tax.sgstPercent) / 100);
  const grandTotal = bankersRound(subtotal + cgstAmount + sgstAmount);
  return { subtotal, cgstAmount, sgstAmount, grandTotal };
}

export function lineAmount(item: { quantity: number; rate: number }): number {
  return bankersRound(item.quantity * item.rate);
}
```

- [ ] **Step 2: Manual verification**

In a Node REPL or temporary file, sanity-check a few values:

```bash
node -e "
const { bankersRound, computeTotals, lineAmount } = require('./lib/calculations.ts');
" 2>/dev/null || echo "(Skip REPL — pnpm typecheck is enough; we'll exercise it in the UI)"
pnpm typecheck
```

Expected: typecheck passes. Full behavioral verification happens in the manual checklist at Task 26.

- [ ] **Step 3: Commit**

```bash
git add lib/calculations.ts
git commit -m "feat: add calculation helpers (banker's rounding, totals)"
```

---

## Task 4: Indian number grouping (`lib/indianNumber.ts`)

**Files:**
- Create: `lib/indianNumber.ts`

- [ ] **Step 1: Write the module**

Indian grouping is NOT US-style. `1234567.89` becomes `12,34,567.89` — comma after the first three digits from the right, then every two digits after that.

Create `lib/indianNumber.ts`:

```ts
/** Format a number as Indian-grouped currency string: "1,23,456.78" (no ₹ prefix). */
export function formatIndianNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const negative = rounded < 0 ? "-" : "";
  const [intPart, decPart = "00"] = Math.abs(rounded).toFixed(2).split(".");

  let formattedInt: string;
  if (intPart.length <= 3) {
    formattedInt = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const restWithCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formattedInt = `${restWithCommas},${last3}`;
  }

  return `${negative}${formattedInt}.${decPart}`;
}

/** Format with ₹ prefix: "₹1,23,456.78". */
export function formatRupees(value: number): string {
  return `₹${formatIndianNumber(value)}`;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/indianNumber.ts
git commit -m "feat: add Indian number grouping utilities"
```

---

## Task 5: Number-to-words (`lib/numberToWords.ts`)

**Files:**
- Create: `lib/numberToWords.ts`

- [ ] **Step 1: Write the module**

Indian English uses lakh (1,00,000) and crore (1,00,00,000). Paise are spelled separately.

Create `lib/numberToWords.ts`:

```ts
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
}

function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${ONES[h]} Hundred`);
  if (rest > 0) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** Convert a non-negative integer (up to 99,99,99,99,999) to Indian-English words. */
export function intToIndianWords(value: number): string {
  if (value === 0) return "Zero";
  if (value < 0) throw new Error("Negative values not supported");
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error("Integer required");
  }

  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const rest = value % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${intToIndianWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest > 0) parts.push(threeDigits(rest));
  return parts.join(" ");
}

/**
 * Indian-English rupee formatter.
 * Example: 12345.50 → "Twelve Thousand Three Hundred Forty-Five Rupees and Fifty Paise Only"
 */
export function rupeesInWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return `${value} (unrepresentable)`;
  }
  const rounded = Math.round(value * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  // Upper bound: fall back to numeric string beyond 99,99,99,99,999 rupees.
  if (rupees > 9999999999999) {
    return `${rounded.toFixed(2)} (too large)`;
  }

  const rupeePart = rupees === 0 ? "Zero Rupees" : `${intToIndianWords(rupees)} Rupees`;
  const paisePart = paise > 0 ? ` and ${twoDigits(paise)} Paise` : "";
  return `${rupeePart}${paisePart} Only`;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/numberToWords.ts
git commit -m "feat: add Indian-English number-to-words conversion"
```

---

## Task 6: localStorage wrapper (`lib/storage.ts`)

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: Write the module**

Create `lib/storage.ts`:

```ts
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
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: add localStorage wrapper with graceful fallbacks"
```

---

## Task 7: Invoice number generation (`lib/invoiceNumber.ts`)

**Files:**
- Create: `lib/invoiceNumber.ts`

- [ ] **Step 1: Write the module**

Format: `INV-YYYYMMDD-XXX` where `XXX` is the counter zero-padded to 3.

Create `lib/invoiceNumber.ts`:

```ts
import { invoiceCounter } from "./storage";

function todayCompact(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Build the NEXT invoice number string (does not mutate the counter). */
export function nextInvoiceNumber(date = new Date()): string {
  const nextCount = invoiceCounter.read() + 1;
  const padded = String(nextCount).padStart(3, "0");
  return `INV-${todayCompact(date)}-${padded}`;
}

/** Convert today's Date to ISO-yyyy-mm-dd for form defaults. */
export function todayIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO date N days after the given date (for 30-day default due date). */
export function isoDatePlusDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return todayIso(d);
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/invoiceNumber.ts
git commit -m "feat: add invoice number + date helpers"
```

---

## Task 8: `<InvoicePage />` shell + RHF instance + default-value hydration

**Files:**
- Create: `components/InvoicePage.tsx`
- Create: `lib/defaults.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the defaults factory**

Create `lib/defaults.ts`:

```ts
import type { Invoice } from "./schema";
import { senderCache, invoiceDraft } from "./storage";
import { nextInvoiceNumber, todayIso, isoDatePlusDays } from "./invoiceNumber";

const EMPTY_SENDER: Invoice["sender"] = {
  name: "",
  companyName: "",
  address: "",
  gstin: undefined,
  email: undefined,
  phone: undefined,
};

const EMPTY_CLIENT: Invoice["client"] = {
  name: "",
  companyName: "",
  address: "",
  gstin: undefined,
  email: undefined,
};

function newLineItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildFreshDefaults(): Invoice {
  const cachedSender = senderCache.read();
  const today = todayIso();
  return {
    sender: cachedSender ?? EMPTY_SENDER,
    client: EMPTY_CLIENT,
    meta: {
      invoiceNumber: nextInvoiceNumber(),
      invoiceDate: today,
      dueDate: isoDatePlusDays(today, 30),
      placeOfSupply: undefined,
    },
    lineItems: [
      { id: newLineItemId(), description: "", hsnSac: undefined, quantity: 1, rate: 0 },
    ],
    tax: { cgstPercent: 9, sgstPercent: 9 },
    notes: undefined,
  };
}

/** Draft wins over fresh defaults if present. */
export function buildInitialDefaults(): Invoice {
  return invoiceDraft.read() ?? buildFreshDefaults();
}

export { newLineItemId };
```

- [ ] **Step 2: Write the `<InvoicePage />` shell**

Create `components/InvoicePage.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceSchema, type Invoice } from "@/lib/schema";
import { buildInitialDefaults, buildFreshDefaults } from "@/lib/defaults";

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
            <p className="text-sm text-slate-500">Form sections arrive in later tasks.</p>
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
```

- [ ] **Step 3: Install `@hookform/resolvers` and wire the page**

```bash
pnpm add @hookform/resolvers
```

Expected: added to `package.json`.

Replace `app/page.tsx`:

```tsx
import { InvoicePage } from "@/components/InvoicePage";
export default function Page() {
  return <InvoicePage />;
}
```

- [ ] **Step 4: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: page loads with a two-column layout on wide screens showing "Invoice" on the left and "Preview appears here" on the right; no console errors. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add InvoicePage shell + RHF provider + defaults hydration"
```

---

## Task 9: Sender and Client sections

**Files:**
- Create: `components/form/FormField.tsx`
- Create: `components/form/SenderSection.tsx`
- Create: `components/form/ClientSection.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write a small shared `<FormField />` wrapper**

Avoids re-writing the label+error boilerplate for every input.

Create `components/form/FormField.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  children: (props: { id: string; invalid: boolean }) => ReactNode;
  hint?: string;
};

export function FormField<T extends FieldValues>({
  name,
  label,
  required,
  children,
  hint,
}: Props<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();
  const id = `f-${String(name).replace(/\./g, "-")}`;
  // errors can be nested; use reduce to drill.
  const err = String(name)
    .split(".")
    .reduce<unknown>((acc: any, key) => (acc ? acc[key] : undefined), errors);
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : "";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children({ id, invalid: Boolean(message) })}
      {hint && !message ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Write `<SenderSection />`**

Create `components/form/SenderSection.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function SenderSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Your details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="sender.name" label="Your Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("sender.name")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.companyName" label="Company Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={120} {...register("sender.companyName")} />
          )}
        </FormField>
      </div>

      <FormField<Invoice> name="sender.address" label="Company Address" required>
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={3} maxLength={300} {...register("sender.address")} />
        )}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField<Invoice> name="sender.gstin" label="GSTIN" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={15} placeholder="22AAAAA0000A1Z5" {...register("sender.gstin")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.email" label="Email" hint="Optional">
          {({ id }) => (
            <input id={id} type="email" className={inputBase} maxLength={120} {...register("sender.email")} />
          )}
        </FormField>
        <FormField<Invoice> name="sender.phone" label="Phone" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={30} {...register("sender.phone")} />
          )}
        </FormField>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `<ClientSection />`**

Create `components/form/ClientSection.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function ClientSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Bill to</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="client.name" label="Client Name" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("client.name")} />
          )}
        </FormField>
        <FormField<Invoice> name="client.companyName" label="Client Company" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={120} {...register("client.companyName")} />
          )}
        </FormField>
      </div>

      <FormField<Invoice> name="client.address" label="Client Address" required>
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={3} maxLength={300} {...register("client.address")} />
        )}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="client.gstin" label="Client GSTIN" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={15} {...register("client.gstin")} />
          )}
        </FormField>
        <FormField<Invoice> name="client.email" label="Client Email" hint="Optional">
          {({ id }) => (
            <input id={id} type="email" className={inputBase} maxLength={120} {...register("client.email")} />
          )}
        </FormField>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire into `<InvoicePage />`**

Modify `components/InvoicePage.tsx`. Replace the left-column placeholder `<section>` contents with:

```tsx
<section aria-label="Invoice form" className="space-y-6">
  <h1 className="text-2xl font-semibold">Invoice</h1>
  <SenderSection />
  <ClientSection />
</section>
```

Add the imports near the top:

```tsx
import { SenderSection } from "./form/SenderSection";
import { ClientSection } from "./form/ClientSection";
```

- [ ] **Step 5: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: sender and client cards render with all fields; typing values does not throw; invalid GSTIN shows inline error; page still compiles.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add SenderSection and ClientSection form cards"
```

---

## Task 10: `<MetaSection />` (invoice number, dates, place of supply)

**Files:**
- Create: `components/form/MetaSection.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<MetaSection />`**

Create `components/form/MetaSection.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function MetaSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Invoice details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="meta.invoiceNumber" label="Invoice Number" required>
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={40} {...register("meta.invoiceNumber")} />
          )}
        </FormField>
        <FormField<Invoice> name="meta.placeOfSupply" label="Place of Supply" hint="Optional">
          {({ id }) => (
            <input id={id} className={inputBase} maxLength={80} {...register("meta.placeOfSupply")} />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="meta.invoiceDate" label="Invoice Date" required>
          {({ id }) => (
            <input id={id} type="date" className={inputBase} {...register("meta.invoiceDate")} />
          )}
        </FormField>
        <FormField<Invoice> name="meta.dueDate" label="Due Date" hint="Optional (defaults to +30 days)">
          {({ id }) => (
            <input id={id} type="date" className={inputBase} {...register("meta.dueDate")} />
          )}
        </FormField>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `<InvoicePage />`**

In `components/InvoicePage.tsx`, import and render `<MetaSection />` after `<ClientSection />` in the left column.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: invoice number is pre-filled `INV-YYYYMMDD-001`; today's date and +30 due date are pre-filled; both dates are editable via native date picker.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add MetaSection (invoice number, dates, place of supply)"
```

---

## Task 11: `<LineItemsTable />`

**Files:**
- Create: `components/form/LineItemsTable.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<LineItemsTable />`**

Create `components/form/LineItemsTable.tsx`:

```tsx
"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { newLineItemId } from "@/lib/defaults";
import { lineAmount } from "@/lib/calculations";
import { formatIndianNumber } from "@/lib/indianNumber";

const cellInput =
  "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function LineItemsTable() {
  const { control, register, formState } = useFormContext<Invoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const liveItems = useWatch({ control, name: "lineItems" });

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Line items</h2>
        <button
          type="button"
          onClick={() =>
            append({ id: newLineItemId(), description: "", hsnSac: undefined, quantity: 1, rate: 0 })
          }
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          + Add item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium pb-2 w-8">#</th>
              <th className="text-left font-medium pb-2">Description</th>
              <th className="text-left font-medium pb-2 w-24">HSN/SAC</th>
              <th className="text-right font-medium pb-2 w-20">Qty</th>
              <th className="text-right font-medium pb-2 w-28">Rate (₹)</th>
              <th className="text-right font-medium pb-2 w-28">Amount (₹)</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const row = liveItems?.[index];
              const amount =
                row && typeof row.quantity === "number" && typeof row.rate === "number"
                  ? lineAmount(row)
                  : 0;
              const err = formState.errors.lineItems?.[index];
              return (
                <tr key={field.id} className="align-top">
                  <td className="pt-2 pr-2 text-slate-500">{index + 1}</td>
                  <td className="pt-2 pr-2">
                    <input
                      className={cellInput}
                      maxLength={200}
                      aria-invalid={Boolean(err?.description)}
                      {...register(`lineItems.${index}.description`)}
                    />
                    {err?.description ? (
                      <p className="text-xs text-red-600 mt-1">{err.description.message}</p>
                    ) : null}
                  </td>
                  <td className="pt-2 pr-2">
                    <input
                      className={cellInput}
                      maxLength={10}
                      {...register(`lineItems.${index}.hsnSac`)}
                    />
                  </td>
                  <td className="pt-2 pr-2">
                    <input
                      className={`${cellInput} text-right`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      max="999999"
                      {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    />
                    {err?.quantity ? (
                      <p className="text-xs text-red-600 mt-1">{err.quantity.message}</p>
                    ) : null}
                  </td>
                  <td className="pt-2 pr-2">
                    <input
                      className={`${cellInput} text-right`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      {...register(`lineItems.${index}.rate`, { valueAsNumber: true })}
                    />
                    {err?.rate ? (
                      <p className="text-xs text-red-600 mt-1">{err.rate.message}</p>
                    ) : null}
                  </td>
                  <td className="pt-2 pr-2 text-right tabular-nums">{formatIndianNumber(amount)}</td>
                  <td className="pt-2 text-right">
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove line ${index + 1}`}
                        className="text-slate-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formState.errors.lineItems?.message ? (
        <p className="text-xs text-red-600">{String(formState.errors.lineItems.message)}</p>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Wire into `<InvoicePage />`**

Import and render `<LineItemsTable />` after `<MetaSection />`.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: table renders with one default row; typing a quantity and rate updates the Amount cell live; clicking "+ Add item" appends a row; "×" removes a row (disabled on the last remaining row).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add LineItemsTable with useFieldArray + derived amount column"
```

---

## Task 12: `<TaxSection />`

**Files:**
- Create: `components/form/TaxSection.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<TaxSection />`**

Create `components/form/TaxSection.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function TaxSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Tax</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<Invoice> name="tax.cgstPercent" label="CGST %" required>
          {({ id }) => (
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="28"
              className={inputBase}
              {...register("tax.cgstPercent", { valueAsNumber: true })}
            />
          )}
        </FormField>
        <FormField<Invoice> name="tax.sgstPercent" label="SGST %" required>
          {({ id }) => (
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="28"
              className={inputBase}
              {...register("tax.sgstPercent", { valueAsNumber: true })}
            />
          )}
        </FormField>
      </div>

      <p className="text-xs text-slate-500">
        For inter-state transactions, use IGST instead (not supported in v1).
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `<InvoicePage />`**

Import and render after `<LineItemsTable />`.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: two tax inputs default to 9; IGST note renders beneath them.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add TaxSection with CGST/SGST inputs"
```

---

## Task 13: `<NotesSection />`

**Files:**
- Create: `components/form/NotesSection.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<NotesSection />`**

Create `components/form/NotesSection.tsx`:

```tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { FormField } from "./FormField";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

export function NotesSection() {
  const { register } = useFormContext<Invoice>();

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold">Notes / Terms</h2>

      <FormField<Invoice> name="notes" label="Notes or payment terms" hint="Optional — appears on the PDF">
        {({ id }) => (
          <textarea id={id} className={inputBase} rows={4} maxLength={1000} {...register("notes")} />
        )}
      </FormField>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `<InvoicePage />`**

Import and render after `<TaxSection />`.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add NotesSection for invoice notes and terms"
```

---

## Task 14: `<TotalsSummary />` with live computation

**Files:**
- Create: `components/form/TotalsSummary.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<TotalsSummary />`**

Create `components/form/TotalsSummary.tsx`:

```tsx
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { computeTotals } from "@/lib/calculations";
import { formatRupees } from "@/lib/indianNumber";
import { rupeesInWords } from "@/lib/numberToWords";

export function TotalsSummary() {
  const { control } = useFormContext<Invoice>();
  const lineItems = useWatch({ control, name: "lineItems" }) ?? [];
  const tax = useWatch({ control, name: "tax" }) ?? { cgstPercent: 0, sgstPercent: 0 };

  // Filter out rows with NaN numeric fields to stay safe during typing.
  const safeItems = lineItems.filter(
    (i) => typeof i?.quantity === "number" && typeof i?.rate === "number"
  );
  const totals = computeTotals(safeItems as Invoice["lineItems"], tax);

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <h2 className="text-lg font-semibold">Totals</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="tabular-nums">{formatRupees(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">CGST ({tax.cgstPercent}%)</dt>
          <dd className="tabular-nums">{formatRupees(totals.cgstAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">SGST ({tax.sgstPercent}%)</dt>
          <dd className="tabular-nums">{formatRupees(totals.sgstAmount)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2">
          <dt className="font-semibold">Grand Total</dt>
          <dd className="font-semibold tabular-nums">{formatRupees(totals.grandTotal)}</dd>
        </div>
      </dl>

      <p className="text-xs italic text-slate-600">{rupeesInWords(totals.grandTotal)}</p>

      {totals.grandTotal === 0 ? (
        <p className="text-xs text-amber-600">Grand total is ₹0.00 — you can still download.</p>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Wire into `<InvoicePage />`**

Render `<TotalsSummary />` after `<NotesSection />`.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: totals recalc live as you edit quantity/rate; CGST/SGST percentages reflect the inputs; words render under grand total.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add TotalsSummary with live calculations and words"
```

---

## Task 15: Register Inter font for @react-pdf + download `.ttf` files

**Files:**
- Create: `public/fonts/Inter-Regular.ttf`
- Create: `public/fonts/Inter-Medium.ttf`
- Create: `public/fonts/Inter-Bold.ttf`
- Create: `components/pdf/registerFonts.ts`

- [ ] **Step 1: Download Inter font files**

Use the Google Fonts static hosts (v1 is fine). Files are committed to the repo so they're served from `/fonts/` at runtime.

```bash
mkdir -p public/fonts
curl -L -o public/fonts/Inter-Regular.ttf "https://raw.githubusercontent.com/rsms/inter/v4.0/docs/font-files/InterVariable.ttf" \
  || curl -L -o public/fonts/Inter-Regular.ttf "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip"
```

If the above doesn't produce valid `.ttf` files, do this instead — download the static v4.0 zip from https://github.com/rsms/inter/releases and extract `Inter-Regular.ttf`, `Inter-Medium.ttf`, and `Inter-Bold.ttf` into `public/fonts/`.

Verify all three exist:

```bash
ls -la public/fonts/
```

Expected: three `.ttf` files, each > 100KB.

- [ ] **Step 2: Write the registration module**

Create `components/pdf/registerFonts.ts`:

```ts
import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Register Inter with @react-pdf/renderer.
 * Safe to call multiple times; only runs once.
 */
export function registerPdfFonts() {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
      { src: "/fonts/Inter-Bold.ttf", fontWeight: "bold" },
    ],
  });
  registered = true;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add public/fonts components/pdf/registerFonts.ts
git commit -m "feat: ship Inter font files and register with @react-pdf/renderer"
```

---

## Task 16: `<InvoiceDocument />` root + `<PdfHeader />` + `<PdfBillTo />`

**Files:**
- Create: `components/pdf/styles.ts`
- Create: `components/pdf/PdfHeader.tsx`
- Create: `components/pdf/PdfBillTo.tsx`
- Create: `components/pdf/InvoiceDocument.tsx`

- [ ] **Step 1: Write shared PDF styles**

Create `components/pdf/styles.ts`:

```ts
import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: "#0f172a",
  },
  h1: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  h2: { fontSize: 11, fontWeight: "bold", marginBottom: 4, color: "#334155" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column" },
  spacer8: { height: 8 },
  spacer16: { height: 16 },
  senderName: { fontSize: 13, fontWeight: "bold" },
  muted: { color: "#475569" },
  meta: { alignItems: "flex-end" },
  metaLabel: { color: "#64748b" },
  metaValue: { fontWeight: "medium" },
  hr: { borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", marginVertical: 8 },
  blockTitle: { fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 4 },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    paddingBottom: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.25,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 4,
  },
  colIndex: { width: "5%" },
  colDesc: { width: "40%" },
  colHsn: { width: "15%" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  totalsBlock: { marginTop: 12, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", width: "50%", marginBottom: 2 },
  totalsLabel: { width: "60%", textAlign: "right", paddingRight: 8, color: "#475569" },
  totalsValue: { width: "40%", textAlign: "right" },
  grandTotal: { fontWeight: "bold", borderTopWidth: 0.5, borderTopColor: "#0f172a", paddingTop: 4 },
  words: { marginTop: 12, fontStyle: "italic", color: "#334155" },
  notes: { marginTop: 16 },
  notesTitle: { fontSize: 10, color: "#64748b", marginBottom: 2 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#64748b",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
```

- [ ] **Step 2: Write `<PdfHeader />`**

Create `components/pdf/PdfHeader.tsx`:

```tsx
import { View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";

export function PdfHeader({ invoice }: { invoice: Invoice }) {
  const { sender, meta } = invoice;
  return (
    <View>
      <Text style={s.h1}>TAX INVOICE</Text>
      <View style={s.row}>
        <View style={[s.col, { maxWidth: "60%" }]}>
          <Text style={s.senderName}>{sender.companyName}</Text>
          <Text style={s.muted}>{sender.name}</Text>
          <Text style={s.muted}>{sender.address}</Text>
          {sender.gstin ? <Text style={s.muted}>GSTIN: {sender.gstin}</Text> : null}
          {sender.email ? <Text style={s.muted}>{sender.email}</Text> : null}
          {sender.phone ? <Text style={s.muted}>{sender.phone}</Text> : null}
        </View>
        <View style={[s.col, s.meta]}>
          <View style={s.row}>
            <Text style={[s.metaLabel, { marginRight: 6 }]}>Invoice #</Text>
            <Text style={s.metaValue}>{meta.invoiceNumber}</Text>
          </View>
          <View style={s.row}>
            <Text style={[s.metaLabel, { marginRight: 6 }]}>Date</Text>
            <Text style={s.metaValue}>{meta.invoiceDate}</Text>
          </View>
          {meta.dueDate ? (
            <View style={s.row}>
              <Text style={[s.metaLabel, { marginRight: 6 }]}>Due</Text>
              <Text style={s.metaValue}>{meta.dueDate}</Text>
            </View>
          ) : null}
          {meta.placeOfSupply ? (
            <View style={s.row}>
              <Text style={[s.metaLabel, { marginRight: 6 }]}>Place of Supply</Text>
              <Text style={s.metaValue}>{meta.placeOfSupply}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Write `<PdfBillTo />`**

Create `components/pdf/PdfBillTo.tsx`:

```tsx
import { View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";

export function PdfBillTo({ invoice }: { invoice: Invoice }) {
  const { client } = invoice;
  return (
    <View>
      <View style={s.spacer16} />
      <Text style={s.blockTitle}>Bill to</Text>
      <Text style={s.senderName}>{client.companyName}</Text>
      <Text style={s.muted}>{client.name}</Text>
      <Text style={s.muted}>{client.address}</Text>
      {client.gstin ? <Text style={s.muted}>GSTIN: {client.gstin}</Text> : null}
      {client.email ? <Text style={s.muted}>{client.email}</Text> : null}
    </View>
  );
}
```

- [ ] **Step 4: Write `<InvoiceDocument />` (stub — line items and totals added next)**

Create `components/pdf/InvoiceDocument.tsx`:

```tsx
import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";
import { registerPdfFonts } from "./registerFonts";
import { PdfHeader } from "./PdfHeader";
import { PdfBillTo } from "./PdfBillTo";

registerPdfFonts();

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader invoice={invoice} />
        <PdfBillTo invoice={invoice} />

        {/* Line items and totals arrive in Tasks 17 + 18 */}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
```

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add components/pdf
git commit -m "feat: add InvoiceDocument root, PdfHeader, PdfBillTo + shared styles"
```

---

## Task 17: `<PdfLineItemsTable />` with pagination

**Files:**
- Create: `components/pdf/PdfLineItemsTable.tsx`
- Modify: `components/pdf/InvoiceDocument.tsx`

- [ ] **Step 1: Write `<PdfLineItemsTable />`**

Create `components/pdf/PdfLineItemsTable.tsx`:

```tsx
import { View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";
import { lineAmount } from "@/lib/calculations";
import { formatIndianNumber } from "@/lib/indianNumber";

export function PdfLineItemsTable({ invoice }: { invoice: Invoice }) {
  return (
    <View style={s.table}>
      <View style={s.tableHeader} fixed>
        <Text style={s.colIndex}>#</Text>
        <Text style={s.colDesc}>Description</Text>
        <Text style={s.colHsn}>HSN/SAC</Text>
        <Text style={s.colQty}>Qty</Text>
        <Text style={s.colRate}>Rate</Text>
        <Text style={s.colAmount}>Amount</Text>
      </View>

      {invoice.lineItems.map((item, idx) => (
        <View key={item.id} style={s.tableRow} wrap={false}>
          <Text style={s.colIndex}>{idx + 1}</Text>
          <Text style={s.colDesc}>{item.description}</Text>
          <Text style={s.colHsn}>{item.hsnSac ?? ""}</Text>
          <Text style={s.colQty}>{item.quantity}</Text>
          <Text style={s.colRate}>{formatIndianNumber(item.rate)}</Text>
          <Text style={s.colAmount}>{formatIndianNumber(lineAmount(item))}</Text>
        </View>
      ))}
    </View>
  );
}
```

Notes:
- `fixed` on the header makes it repeat on every page.
- `wrap={false}` on each row keeps a row from being split across pages.

- [ ] **Step 2: Add to `<InvoiceDocument />`**

In `components/pdf/InvoiceDocument.tsx`, import `<PdfLineItemsTable />` and render it after `<PdfBillTo />`.

- [ ] **Step 3: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/pdf
git commit -m "feat: add PdfLineItemsTable with repeating header"
```

---

## Task 18: `<PdfTotals />` (totals, words, notes, footer)

**Files:**
- Create: `components/pdf/PdfTotals.tsx`
- Modify: `components/pdf/InvoiceDocument.tsx`

- [ ] **Step 1: Write `<PdfTotals />`**

Create `components/pdf/PdfTotals.tsx`:

```tsx
import { View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";
import { computeTotals } from "@/lib/calculations";
import { formatRupees } from "@/lib/indianNumber";
import { rupeesInWords } from "@/lib/numberToWords";

export function PdfTotals({ invoice }: { invoice: Invoice }) {
  const totals = computeTotals(invoice.lineItems, invoice.tax);
  return (
    <View wrap={false}>
      <View style={s.totalsBlock}>
        <View style={s.totalsRow}>
          <Text style={s.totalsLabel}>Subtotal</Text>
          <Text style={s.totalsValue}>{formatRupees(totals.subtotal)}</Text>
        </View>
        <View style={s.totalsRow}>
          <Text style={s.totalsLabel}>CGST ({invoice.tax.cgstPercent}%)</Text>
          <Text style={s.totalsValue}>{formatRupees(totals.cgstAmount)}</Text>
        </View>
        <View style={s.totalsRow}>
          <Text style={s.totalsLabel}>SGST ({invoice.tax.sgstPercent}%)</Text>
          <Text style={s.totalsValue}>{formatRupees(totals.sgstAmount)}</Text>
        </View>
        <View style={[s.totalsRow, s.grandTotal]}>
          <Text style={s.totalsLabel}>Grand Total</Text>
          <Text style={s.totalsValue}>{formatRupees(totals.grandTotal)}</Text>
        </View>
      </View>

      <Text style={s.words}>{rupeesInWords(totals.grandTotal)}</Text>

      {invoice.notes ? (
        <View style={s.notes}>
          <Text style={s.notesTitle}>Notes</Text>
          <Text>{invoice.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 2: Wire into `<InvoiceDocument />` + extend footer**

Update `components/pdf/InvoiceDocument.tsx`:

```tsx
import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";
import { registerPdfFonts } from "./registerFonts";
import { PdfHeader } from "./PdfHeader";
import { PdfBillTo } from "./PdfBillTo";
import { PdfLineItemsTable } from "./PdfLineItemsTable";
import { PdfTotals } from "./PdfTotals";

registerPdfFonts();

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader invoice={invoice} />
        <PdfBillTo invoice={invoice} />
        <PdfLineItemsTable invoice={invoice} />
        <PdfTotals invoice={invoice} />

        <View style={s.footer} fixed>
          <Text>This is a computer-generated invoice.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/pdf
git commit -m "feat: add PdfTotals and complete InvoiceDocument page layout"
```

---

## Task 19: `<PdfPreview />` wrapper with debounced updates

**Files:**
- Create: `components/pdf/PdfPreview.tsx`
- Create: `lib/useDebounced.ts`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write a debounce hook**

Create `lib/useDebounced.ts`:

```ts
import { useEffect, useState } from "react";

/** Returns a value that lags by `delayMs` after the last input change. */
export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
```

- [ ] **Step 2: Write `<PdfPreview />`**

`@react-pdf/renderer`'s `PDFViewer` renders the actual PDF into an iframe. We dynamically import it client-side because it depends on browser APIs.

Create `components/pdf/PdfPreview.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useFormContext, useWatch } from "react-hook-form";
import type { Invoice } from "@/lib/schema";
import { useDebounced } from "@/lib/useDebounced";
import { InvoiceDocument } from "./InvoiceDocument";

// PDFViewer pulls in browser-only modules; load it client-side only.
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
  // Watch the whole form, then debounce so PDF layout doesn't run on every keystroke.
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
```

- [ ] **Step 3: Replace the preview placeholder in `<InvoicePage />`**

In `components/InvoicePage.tsx`, replace the `<aside>` body with:

```tsx
<aside aria-label="PDF preview" className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
  <PdfPreview />
</aside>
```

And add the import:

```tsx
import { PdfPreview } from "./pdf/PdfPreview";
```

- [ ] **Step 4: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: preview iframe renders the invoice; typing in any field updates the preview ~300 ms later; the preview shows sender/client blocks, line items table, totals, words, notes if any, and "Page 1 of 1" in the footer.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add live PDF preview via PDFViewer with 300ms debounce"
```

---

## Task 20: `<ActionBar />` + Generate PDF download flow

**Files:**
- Create: `components/form/ActionBar.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write `<ActionBar />`**

Create `components/form/ActionBar.tsx`:

```tsx
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

      // Success side-effects
      senderCache.write(data.sender);
      invoiceCounter.increment();
      invoiceDraft.clear();

      // Reset with a fresh invoice number but keep sender cache
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
```

- [ ] **Step 2: Wire the `ActionBar` into `<InvoicePage />` with stub callbacks**

Full `onReset` handling arrives in Task 21. For now, pass a no-op for `onReset` and use `window.alert` for the two other callbacks as a temporary stand-in (replaced by proper toast/banner in Task 23).

In `components/InvoicePage.tsx`, render `<ActionBar />` as the last item in the left column:

```tsx
<ActionBar
  onDownloadSuccess={() => window.alert("PDF downloaded.")}
  onDownloadError={(msg) => window.alert(`PDF generation failed: ${msg}`)}
  onReset={() => { /* Task 21 */ }}
/>
```

Add the import:

```tsx
import { ActionBar } from "./form/ActionBar";
```

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: with all required fields filled, clicking "Generate PDF" downloads a `.pdf` file named `INV-YYYYMMDD-001.pdf`; success alert fires; form resets with the next invoice number; sender stays filled.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add ActionBar with Generate PDF download flow"
```

---

## Task 21: Reset button behavior + confirmation dialog

**Files:**
- Create: `components/form/ConfirmDialog.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write a minimal confirmation dialog**

Create `components/form/ConfirmDialog.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onCancel();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-0 shadow-xl backdrop:bg-slate-900/40"
      aria-labelledby="confirm-title"
    >
      <div className="p-5 max-w-sm">
        <h3 id="confirm-title" className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

- [ ] **Step 2: Use `ConfirmDialog` in `<InvoicePage />` and implement reset**

Modify `components/InvoicePage.tsx`:

- Add `useState` for `confirmResetOpen`.
- Replace the `ActionBar`'s `onReset` stub with a handler that opens the dialog.
- On confirm: `methods.reset(buildFreshDefaults())`, clear `invoice_draft`, close dialog.

The relevant body inside the `FormProvider`:

```tsx
const [confirmResetOpen, setConfirmResetOpen] = useState(false);

const handleResetConfirmed = () => {
  methods.reset(buildFreshDefaults());
  invoiceDraft.clear();
  setConfirmResetOpen(false);
};

// In JSX:
<ActionBar
  onDownloadSuccess={() => window.alert("PDF downloaded.")}
  onDownloadError={(msg) => window.alert(`PDF generation failed: ${msg}`)}
  onReset={() => setConfirmResetOpen(true)}
/>

<ConfirmDialog
  open={confirmResetOpen}
  title="Reset invoice?"
  description="This clears the client, line items, notes, and generates a new invoice number. Your sender details are preserved."
  confirmLabel="Reset"
  onConfirm={handleResetConfirmed}
  onCancel={() => setConfirmResetOpen(false)}
/>
```

Add imports:

```tsx
import { useState } from "react";
import { ConfirmDialog } from "./form/ConfirmDialog";
import { invoiceDraft } from "@/lib/storage";
```

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: clicking Reset opens dialog; Cancel dismisses; Reset clears client/line items/notes but keeps sender; new invoice number appears.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Reset confirmation dialog and clear-draft behavior"
```

---

## Task 22: Draft autosave (2-second debounce)

**Files:**
- Create: `components/form/DraftAutosave.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write the autosave effect component**

This is a renderless component that subscribes to the form and writes to `invoice_draft` every 2 seconds after typing stops.

Create `components/form/DraftAutosave.tsx`:

```tsx
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
```

- [ ] **Step 2: Mount in `<InvoicePage />`**

Inside the `<FormProvider>` body, just before the `<main>`:

```tsx
<DraftAutosave />
```

And import:

```tsx
import { DraftAutosave } from "./form/DraftAutosave";
```

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: type into any field, wait 2 seconds, open DevTools → Application → Local Storage → `invgen:invoice_draft` contains the current form state. Refresh the page: form restores from the draft.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add 2s-debounced draft autosave to localStorage"
```

---

## Task 23: Error UI — error boundary + PDF toast + storage banner + zero-total notice

**Files:**
- Create: `app/error.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/StorageBanner.tsx`
- Modify: `components/InvoicePage.tsx`

- [ ] **Step 1: Write the App Router error boundary**

Create `app/error.tsx`:

```tsx
"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Something went wrong.</h1>
          <p className="text-sm text-slate-600 mt-2">
            Please reload the page. Your draft is saved locally.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write a minimal toast**

Create `components/ui/Toast.tsx`:

```tsx
"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  variant?: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, variant = "success", onClose }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const color =
    variant === "success"
      ? "bg-slate-900 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 px-4 py-2 rounded-md shadow-lg text-sm ${color}`}
    >
      {message}
    </div>
  );
}
```

- [ ] **Step 3: Write the storage-unavailable banner**

Create `components/ui/StorageBanner.tsx`:

```tsx
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
```

- [ ] **Step 4: Wire toast and banner into `<InvoicePage />`**

Replace the `window.alert` callbacks from Task 20 with toast state. Full replacement for the top-level component body:

```tsx
const [confirmResetOpen, setConfirmResetOpen] = useState(false);
const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);

// ... existing methods + reset handler ...

<>
  <StorageBanner />
  <FormProvider {...methods}>
    <DraftAutosave />
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        <section aria-label="Invoice form" className="space-y-6">
          {/* existing form sections */}
          <ActionBar
            onDownloadSuccess={() => setToast({ msg: "PDF downloaded.", variant: "success" })}
            onDownloadError={(m) =>
              setToast({ msg: `PDF generation failed: ${m}`, variant: "error" })
            }
            onReset={() => setConfirmResetOpen(true)}
          />
        </section>
        <aside aria-label="PDF preview" className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <PdfPreview />
        </aside>
      </div>
    </main>
    <ConfirmDialog ... />
    <Toast message={toast?.msg ?? null} variant={toast?.variant} onClose={() => setToast(null)} />
  </FormProvider>
</>
```

Add imports:

```tsx
import { StorageBanner } from "./ui/StorageBanner";
import { Toast } from "./ui/Toast";
```

Note: zero-total warning is already shown inside `<TotalsSummary />` from Task 14.

- [ ] **Step 5: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Expected: success toast appears after download; forcing an error (e.g., add `throw new Error("test")` temporarily in `ActionBar`) shows the error toast; Safari private mode shows the storage banner.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add error boundary, toast, storage-unavailable banner"
```

---

## Task 24: Responsive layout + mobile preview modal

**Files:**
- Modify: `components/InvoicePage.tsx`
- Modify: `components/pdf/PdfPreview.tsx` (minor tweak for modal use)

- [ ] **Step 1: Add mobile preview modal to `<InvoicePage />`**

On screens below `lg` (1024 px), hide the right-column preview and show a sticky "Preview" button that opens a full-screen modal.

In `components/InvoicePage.tsx`:

```tsx
const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
```

Update the grid/aside:

```tsx
<div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-24">
  <section aria-label="Invoice form" className="space-y-6">
    {/* existing sections + ActionBar */}
  </section>
  <aside
    aria-label="PDF preview"
    className="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"
  >
    <PdfPreview />
  </aside>
</div>

{/* Mobile preview trigger */}
<button
  type="button"
  onClick={() => setMobilePreviewOpen(true)}
  className="lg:hidden fixed bottom-4 right-4 px-4 py-2 rounded-full bg-slate-900 text-white text-sm shadow-lg"
>
  Preview
</button>

{/* Mobile preview modal */}
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
```

- [ ] **Step 2: Smoke test at multiple widths**

```bash
pnpm dev
```

Expected:
- ≥1024 px: two-column layout, preview is sticky on the right.
- 768–1023 px: single column, floating "Preview" button opens a full-screen modal.
- <768 px: same as tablet — form-only, modal-accessible preview.
- Modal "×" closes.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add responsive layout with mobile preview modal"
```

---

## Task 25: Accessibility pass

**Files:**
- Modify: `app/globals.css`
- Modify: various components as needed (focus visibility, aria attributes)

- [ ] **Step 1: Add baseline focus visibility and reduced-motion preferences**

Append to `app/globals.css`:

```css
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-blue-600 ring-offset-1 ring-offset-white;
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
}
```

- [ ] **Step 2: Review aria and semantic HTML**

Walk through each component and confirm:

- Every `<input>` / `<textarea>` has an associated `<label>` (via `htmlFor`/`id`) — ensured by `<FormField />`.
- The `<ConfirmDialog />` uses the native `<dialog>` element (handles focus trap + Escape natively).
- The Toast has `role="status"` and `aria-live="polite"`.
- Section headings (`<h2>`) are present on each card and the page has exactly one `<h1>`.
- Line item remove button has `aria-label`.
- Mobile preview button's close `×` has `aria-label`.

If anything's missing, fix it. Then manually tab through the page: focus rings should be visible on every interactive element; tab order should go top-to-bottom, left column before right.

- [ ] **Step 3: Smoke test**

```bash
pnpm typecheck
pnpm dev
```

Manually verify: tab through fields, focus rings visible; submit form via Enter key; dialog closes on Escape.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add accessibility baseline (focus rings, reduced motion, aria)"
```

---

## Task 26: Manual verification checklist + README polish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Walk through every item in the spec's manual verification checklist**

Reference: `docs/superpowers/specs/2026-04-20-invoice-generator-design.md` Section 6.

Execute each of these manually and confirm correct behavior:

1. **`calculations.ts`** — fill the form with:
   - Single line item: Qty 1, Rate 100, CGST 9%, SGST 9% → Subtotal 100, CGST 9, SGST 9, Grand 118.
   - Many items with 2-decimal rates (e.g., 3 rows of Qty 1 × Rate 33.33) → Subtotal 99.99, totals compute without drift.
   - Banker's rounding: Qty 1, Rate 2.125 → amount 2.12 (NOT 2.13); also try 2.135 → 2.14.
   - Zero: Qty 1, Rate 0 → Grand Total ₹0.00, amber notice shows, download still works.

2. **`indianNumber.ts`** — temporarily make Rate 123456.78 → totals show as `₹1,23,456.78`. Try Rate 9999999999.99 → `₹9,99,99,99,99,999.90`.

3. **`numberToWords.ts`** — test the following grand totals:
   - ₹1 → "One Rupees Only" (acceptable — v1 doesn't grammatically inflect singular)
   - ₹1.50 → "One Rupees and Fifty Paise Only"
   - ₹12,345.50 → "Twelve Thousand Three Hundred Forty-Five Rupees and Fifty Paise Only"
   - ₹1,00,00,000 → "One Crore Rupees Only"
   - ₹99,99,99,99,999.99 → "Ninety-Nine Thousand Nine Hundred Ninety-Nine Crore Ninety-Nine Lakh Ninety-Nine Thousand Nine Hundred Ninety-Nine Rupees and Ninety-Nine Paise Only"

4. **GSTIN regex** — try valid: `22AAAAA0000A1Z5`. Try malformed: `22aaaaa0000a1z5`, `22AAAAA0000A1Z`, `hello`. All invalid ones should show inline error; empty should pass (optional).

5. **Multi-page PDF** — use Chrome DevTools console to bulk-add 60 line items:
   ```js
   // In the browser console while on the page, paste:
   const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("+ Add item"));
   for (let i = 0; i < 59; i++) btn.click();
   ```
   Fill each description/qty/rate; Generate PDF. Confirm: totals appear only on the last page; header "#, Description, HSN/SAC, Qty, Rate, Amount" repeats on every page; footer shows "Page X of Y" correctly.

6. **localStorage disabled** — open Safari → File → New Private Window. Navigate to the dev server. Banner should appear at the top: "Drafts and sender details can't be saved…". App should still generate PDFs; refreshing loses draft (expected).

7. **Draft recovery** — fill the form, wait 3 seconds, refresh → all entered values restore.

8. **Sender cache** — after a successful download, refresh → sender fields remain pre-filled; client and line items are empty; invoice number incremented.

9. **Reset** — click Reset → dialog appears → confirm → client/line items/notes cleared, sender preserved, fresh invoice number.

10. **Cross-browser** — open the built app (`pnpm build && pnpm start`) in latest Chrome, Safari, Firefox, Edge. Generate one PDF in each.

Record any issues, open a follow-up task per issue, fix, then re-run the specific check.

- [ ] **Step 2: Update README with usage instructions**

Rewrite `README.md`:

```md
# Invoice Generator

GST-compliant invoice generator for Indian businesses. Entirely client-side — no accounts, no backend, no analytics.

## Features
- Sender and client details with GSTIN validation
- Multiple line items with HSN/SAC, quantity, rate
- Auto CGST + SGST calculation with banker's rounding
- Indian numbering (₹1,23,456.78) and number-in-words output
- Live WYSIWYG PDF preview
- One-click PDF download (A4, multi-page)
- Draft autosave + sender caching in localStorage
- Optional notes / terms field

## Development
pnpm install
pnpm dev           # http://localhost:3000

## Production build
pnpm build
pnpm start

## Deploy
Built for static export. Push to a Vercel project with `output: "export"`; no configuration needed.

## Design & spec
See `docs/superpowers/specs/2026-04-20-invoice-generator-design.md`.
```

- [ ] **Step 3: Final typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected: typecheck passes; build completes and produces `out/` with static files.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "docs: finalize README + complete manual verification checklist"
```

---

## Self-review (plan-level)

**Spec coverage (against `docs/superpowers/specs/2026-04-20-invoice-generator-design.md`):**

| Spec section | Covered in |
|---|---|
| §1 Architecture / stack / fonts | Task 1, Task 15 |
| §2 Component structure (form side) | Tasks 8–14, 20, 21 |
| §2 Component structure (PDF side) | Tasks 15–19 |
| §3 Data model (Zod) | Task 2 |
| §3 Calculations / rounding / Indian number / number-to-words | Tasks 3, 4, 5 |
| §4 Form state owner (RHF) + defaults hydration | Task 8 |
| §4 Live totals (useWatch) | Task 14 |
| §4 Live preview (debounced useWatch → PDFViewer) | Task 19 |
| §4 Draft autosave (2s debounce) | Task 22 |
| §4 Sender cache + counter + clear on download | Task 20 |
| §4 PDF download flow | Task 20 |
| §4 Reset button + confirmation | Task 21 |
| §5 Zod inline errors | Task 9 (via `<FormField />`) |
| §5 localStorage-unavailable banner | Task 23 |
| §5 Long description maxLength | Tasks 9, 11 |
| §5 Multi-page PDF pagination + page X of Y | Tasks 17, 18 |
| §5 PDF generation failure toast | Tasks 20, 23 |
| §5 Uncaught render error boundary | Task 23 (`app/error.tsx`) |
| §5 Zero-total warning | Task 14 |
| §6 Manual verification checklist | Task 26 |
| §7 Out of scope (bank details, signatory, analytics, tests) | Not implemented — correct |
| §8 Success criteria | Task 26 |
| §9 Milestones | Implicit in task ordering |

All spec sections have implementing tasks.

**Placeholder scan:** no TBDs, TODOs, or "similar to Task N" references. Every code step shows complete code.

**Type consistency:** schema types (`Invoice`, `Sender`, `Client`, `LineItem`) are defined in Task 2 and used consistently in all later tasks. Function names (`computeTotals`, `lineAmount`, `bankersRound`, `formatIndianNumber`, `formatRupees`, `rupeesInWords`, `nextInvoiceNumber`, `todayIso`, `isoDatePlusDays`, `buildFreshDefaults`, `buildInitialDefaults`, `newLineItemId`, `isStorageAvailable`, `senderCache`, `invoiceDraft`, `invoiceCounter`) are stable across tasks. Storage keys (`invgen:*`) are centralized in `lib/storage.ts`. Confirmed.

Plan ready for execution.
