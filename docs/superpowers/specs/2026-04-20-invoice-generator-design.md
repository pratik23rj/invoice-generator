# Invoice Generator — v1 Design

**Status:** Approved for implementation planning
**Date:** 2026-04-20
**Source PRD:** `/Users/pratik/Downloads/Invoice_Generator_PRD.docx`

This document is the design spec for v1 of a GST-compliant invoice generator for Indian B2B users. It supersedes the PRD wherever they conflict (notably: stack, analytics, testing, and the four "Open Questions" in PRD Section 13).

## Goal

Enable a user to create and download a GST-compliant invoice PDF in under 60 seconds, client-side only, with auto-calculated CGST/SGST/total, live WYSIWYG preview, and localStorage-backed draft persistence and sender caching.

## Decisions that differ from or extend the PRD

| Topic | PRD | This design |
|---|---|---|
| Framework | Next.js 14 App Router | Next.js 15 App Router |
| Notes / T&C field | Open question | Included in v1 (optional multi-line) |
| HSN/SAC per line item | Open question | Included in v1 (optional column) |
| Bank account details | Open question | **Deferred to v2** |
| Authorised Signatory label | Open question | **Deferred to v2** |
| Analytics / metrics (PRD §10) | Implied | **None in v1.** Strict client-side. Section 10 measurement targets dropped. |
| Testing | Unspecified | **No automated tests in v1.** Manual verification of high-risk areas before launch. |
| Accent color | "One accent color" | `blue-600` |
| Font | Inter, system-ui, -apple-system | Inter, registered for both web and PDF |

## 1. Architecture & file layout

**Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + `@react-pdf/renderer` + `react-hook-form` + `zod`. Inter font. `blue-600` accent. Static export, deployed to Vercel CDN.

**Shape:** single route (`/`). No API routes, no server actions, no backend. Fully static build.

**File layout:**

```
/app
  layout.tsx           # Root layout, Inter font, global Tailwind
  page.tsx             # Single route — renders <InvoicePage />
  globals.css          # Tailwind directives, minimal base styles
  error.tsx            # Generic render-error boundary
/components
  InvoicePage.tsx      # Two-column shell (form left, PDFViewer right); mobile fallback
  form/
    SenderSection.tsx
    ClientSection.tsx
    MetaSection.tsx
    LineItemsTable.tsx
    TaxSection.tsx
    NotesSection.tsx
    TotalsSummary.tsx
    ActionBar.tsx
  pdf/
    InvoiceDocument.tsx    # Root <Document> + <Page>
    PdfHeader.tsx
    PdfBillTo.tsx
    PdfLineItemsTable.tsx
    PdfTotals.tsx
    PdfPreview.tsx         # Wraps library's <PDFViewer>
/lib
  schema.ts            # Zod schema + inferred TS type for Invoice
  calculations.ts      # subtotal, CGST, SGST, grand total, banker's rounding
  indianNumber.ts      # Indian digit grouping (₹1,23,456.78)
  numberToWords.ts     # Indian-English Rupees + Paise
  storage.ts           # localStorage read/write (sender cache, draft, counter)
  invoiceNumber.ts     # Format INV-YYYYMMDD-XXX, counter management
/public
  fonts/               # Inter .ttf subsets (Regular, Medium, Bold)
```

**Rationale for the split:** form components (Tailwind HTML) and PDF components (`@react-pdf/renderer` primitives) use different rendering systems and can't share JSX. Pure logic lives in `/lib` so it's trivially unit-testable if testing is added later.

**Fonts:** `@react-pdf/renderer` requires fonts registered via `Font.register()`. We ship Inter `.ttf` subsets in `/public/fonts` and register them once at module load.

## 2. Component structure

### `<InvoicePage />`
Top-level container. Owns the `react-hook-form` instance. Two-column grid on desktop (≥1024 px): form left, `<PDFPreview />` right. Tablet (768–1024 px): stacked with a sticky preview toggle. Mobile (< 768 px): form only, preview opens in a full-screen modal.

### Form side (`/components/form/`)

- **`<SenderSection />`** — Your Name, Company Name, Company Address, GSTIN, Email, Phone. On mount, reads `sender_cache` from localStorage and pre-fills.
- **`<ClientSection />`** — Client Name, Client Company, Address, GSTIN, Email.
- **`<MetaSection />`** — Invoice Number (auto, editable), Invoice Date (default today), Due Date (default invoice date + 30), Place of Supply (optional).
- **`<LineItemsTable />`** — `useFieldArray`. Columns: #, Description, HSN/SAC (optional), Qty, Rate, Amount (derived, read-only), × remove. "+ Add Item" button. Enforces minimum one row.
- **`<TaxSection />`** — CGST % and SGST % (default 9% each). Inline hint: "For inter-state transactions, use IGST instead (not supported in v1)."
- **`<NotesSection />`** — Optional multi-line textarea, ≤1000 chars.
- **`<TotalsSummary />`** — Read-only display. Subscribes via `useWatch(['lineItems', 'tax'])`, calls `calculations.ts`. No memoization at this scale (≤50 rows).
- **`<ActionBar />`** — Primary `Generate PDF` (disabled while `formState.isValid === false`) + secondary `Reset` (with confirmation).

### Preview side (`/components/pdf/`)

- **`<InvoiceDocument invoice={...} />`** — Root `<Document>` + one or more `<Page>`.
- **`<PdfHeader />`** — "TAX INVOICE" centered, sender block left, invoice-meta block right.
- **`<PdfBillTo />`** — Client block.
- **`<PdfLineItemsTable />`** — Wrap-flowed line items. Multi-page pagination handled by the library.
- **`<PdfTotals />`** — Subtotal, CGST, SGST, Grand Total, amount in words (italic), Notes (if present), "This is a computer-generated invoice" footer, `Page X of Y`.
- **`<PdfPreview />`** — Wraps `<PDFViewer>` from `@react-pdf/renderer`. Receives a debounced (300 ms) invoice snapshot via `useWatch`.

## 3. Data model

A single Zod schema is the source of truth. The TS type is inferred via `z.infer`. Shape:

```
Invoice {
  sender: {
    name: string            // required, ≤ 80
    companyName: string     // required, ≤ 120
    address: string         // required, ≤ 300, multi-line
    gstin?: string          // optional, 15-char regex if present
    email?: string          // optional, email regex if present
    phone?: string          // optional, freeform
  }

  client: {
    name: string            // required, ≤ 80
    companyName: string     // required, ≤ 120
    address: string         // required, ≤ 300
    gstin?: string
    email?: string
  }

  meta: {
    invoiceNumber: string   // default INV-YYYYMMDD-XXX, user-editable
    invoiceDate: string     // ISO date, default today
    dueDate?: string        // ISO date, default invoiceDate + 30
    placeOfSupply?: string
  }

  lineItems: Array<{        // min length 1
    id: string              // uuid (crypto.randomUUID())
    description: string     // required, ≤ 200
    hsnSac?: string         // optional, alphanumeric, ≤ 10
    quantity: number        // required, 0.01–999999, ≤ 2 decimals
    rate: number            // required, ≥ 0, ≤ 2 decimals
    // amount is NOT stored — always derived = quantity * rate
  }>

  tax: {
    cgstPercent: number     // required, 0–28, ≤ 2 decimals, default 9
    sgstPercent: number     // required, 0–28, ≤ 2 decimals, default 9
  }

  notes?: string            // optional, ≤ 1000
}
```

**Computed values** (in `calculations.ts`, never stored):

- `subtotal = Σ(quantity * rate)`
- `cgstAmount = subtotal * cgstPercent / 100`
- `sgstAmount = subtotal * sgstPercent / 100`
- `grandTotal = subtotal + cgstAmount + sgstAmount`
- `amountInWords` — Indian-English Rupees + Paise

All monetary values rounded to 2 decimals using **banker's rounding** (round-half-to-even) to avoid upward bias across many invoices. Display uses Indian grouping: `₹1,23,456.78`.

**GSTIN regex:** `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`

**Explicitly absent (deferred to v2):** `bankDetails`, signatory label, logo, multi-currency, IGST, TDS, reverse-charge.

## 4. Data flow

**Form state owner:** React Hook Form. RHF holds the canonical Invoice. No other source of truth — no separate component state, no context, no localStorage-as-live-store.

**Initial state on page load:**

1. Read `sender_cache` from localStorage → `defaultValues.sender` if present.
2. Read `invoice_draft` → full `defaultValues` if present (draft wins over sender cache alone).
3. Compute `meta.invoiceNumber` as `INV-YYYYMMDD-XXX` where `XXX = (invoice_counter + 1).padStart(3, '0')`. Counter defaults to 0.
4. `meta.invoiceDate` = today ISO. `meta.dueDate` = today + 30 days.
5. `lineItems` defaults to one empty row.

**Live totals:** `<TotalsSummary />` uses `useWatch({ name: ['lineItems', 'tax'] })` → re-renders on any change → calls pure fns in `calculations.ts`.

**Live preview:** `<PDFPreview />` uses the same `useWatch` but debounced at 300 ms → passes the snapshot into `<InvoiceDocument invoice={...} />` → `<PDFViewer>` renders the real PDF inline via iframe. True WYSIWYG — the preview *is* the PDF.

**Persistence:**

- **Draft autosave:** `useEffect` + `watch()` + 2-second debounce → writes full Invoice to `invoice_draft`.
- **Sender cache:** on successful PDF download, write `invoice.sender` to `sender_cache`.
- **Counter:** `invoice_counter` in localStorage, incremented after successful download.

**PDF download flow:**

1. User clicks `Generate PDF`.
2. `form.handleSubmit(async (data) => { ... })`. Zod revalidates. Invalid → inline errors, no download.
3. Valid: `const blob = await pdf(<InvoiceDocument invoice={data} />).toBlob()`.
4. Create `<a>`, set `href = URL.createObjectURL(blob)`, `download = ${data.meta.invoiceNumber}.pdf`, click, revoke URL.
5. Increment `invoice_counter`. Write `data.sender` to `sender_cache`. Delete `invoice_draft`.
6. Reset the form with new defaults (new invoice number, today's dates, empty client, one empty line item). Sender stays pre-filled. User stays on page ready for the next invoice.

**Reset button:** confirmation dialog, then clears form to fresh defaults while preserving `sender_cache`.

**Validation boundary:** Zod at form submit only. Calculation and rendering code trusts its inputs because Zod has already shaped them.

## 5. Error handling & edge cases

- **Form errors (Zod):** inline under the offending input (`text-red-600 text-sm`) via `formState.errors`. Generate PDF disabled while `!isValid`. Reset always enabled.
- **Numeric bounds:** enforced by Zod and by native `type="number"` with `min`/`max`/`step`.
- **Invalid GSTIN:** optional → empty passes, malformed fails. Strict-when-present.
- **Empty line items:** schema enforces `min(1)`; each row requires description, quantity, rate. Download disabled until at least one fully-valid row exists.
- **Zero grand total:** allowed. Inline info banner next to totals: "Grand total is ₹0.00 — download anyway?" Not blocking.
- **localStorage unavailable:** all reads return `null`, all writes are `try/catch`-wrapped no-ops. Dismissable banner on first load: "Drafts won't be saved in this browser session." App functions otherwise.
- **Long descriptions (> 200 chars):** input has `maxLength={200}` — browser prevents over-typing. No truncation needed.
- **Multi-page invoices:** `@react-pdf/renderer` paginates automatically via `wrap` on the line-items container. `<PdfTotals />` is a non-wrapping block that flows onto the last page. Footer uses `<Text render={({ pageNumber, totalPages }) => ...}`.
- **Large totals:** `numberToWords.ts` supports up to ₹99,99,99,99,999.99. Beyond that, fall back to numeric string.
- **PDF generation failure:** `try/catch` around `pdf().toBlob()`. On failure: toast "PDF generation failed. Please try again." Counter does NOT increment. Draft is NOT cleared.
- **Uncaught render error:** Next.js `app/error.tsx` renders "Something went wrong. Reload the page." — no stack trace exposed.

## 6. Testing

**Decision:** no automated tests in v1. Spec reflects that — no Vitest, no Playwright, no CI test job.

**Manual verification checklist before launch** (high-risk areas):

1. `calculations.ts` — subtotal, CGST, SGST, grand total with: single-item whole-number case; many-item 2-decimal case; banker's-rounding edge (e.g., `2.125 → 2.12`, not `2.13`); zero-total case.
2. `indianNumber.ts` — grouping across magnitudes: thousands, lakhs, crores. Confirm `1,23,456.78` format, not `123,456.78`.
3. `numberToWords.ts` — verify with ₹1, ₹1.50, ₹12,345.50, ₹1,00,00,000, and ₹99,99,99,99,999.99. Correct paise handling.
4. GSTIN regex — test 2–3 real GSTINs and at least three deliberate malformations.
5. Multi-page PDF — test with 5, 25, 60, and 100 line items. Confirm totals only on last page and `Page X of Y` is correct.
6. localStorage fallback — test in Safari private mode. Confirm no crash and banner appears.

**Future testing plan (v2):** start with unit tests for `/lib/*` (pure functions, highest value per line of test code) before any component or E2E tests.

## 7. Out of scope for v1

**From PRD Section 3.2:** user auth, payment collection, IGST / TDS / reverse charge, multi-currency, e-invoicing / IRN / GSTN API, recurring invoices, quotations, purchase orders, credit notes, CRM / client management, email delivery.

**From PRD Open Questions (user decisions):** bank account details block, "Authorised Signatory" label.

**From metrics decision:** all analytics / telemetry. No page-view tracking, no event tracking, no error reporting service.

**From testing decision:** entire automated test suite.

**v2 roadmap candidates** (not commitments):

- Auth + saved invoices + saved clients (Next.js API routes become useful here — a key reason we chose Next over Vite).
- IGST for inter-state supply.
- Bank account block on sender + Authorised Signatory label.
- Logo upload + per-user accent color.
- Email delivery (with optional tracking pixel).
- Razorpay payment link on invoice.
- Privacy-friendly analytics (Plausible or similar).
- Automated tests starting with `/lib/*` unit tests.
- E-invoicing / IRN for clients above ₹5 Cr turnover threshold.
- Currency support beyond INR.

## 8. Success criteria for v1

Since analytics are out, success is judged by manual acceptance, not measured metrics:

- Fresh user can produce a valid, downloaded PDF in under 60 seconds on desktop.
- GST math on the PDF matches a hand calculation for at least five test invoices.
- Indian numbering and number-in-words render correctly across the six verification cases in Section 6.
- Preview and PDF match exactly (guaranteed by architecture — `<PDFViewer>` renders the real document).
- Sender details auto-fill on second visit; draft recovers after accidental refresh.
- Works on the latest two versions of Chrome, Safari, Firefox, and Edge.
- PDF downloads correctly on desktop and mobile browsers.

## 9. Milestones (from PRD Section 12, adjusted)

- **M1 (Week 1):** project scaffolding (Next 15 + TS + Tailwind + `@react-pdf/renderer` + RHF + Zod), Inter font registration, Zod schema, `/lib` pure functions.
- **M2 (Week 2):** form components + live `<TotalsSummary />` + draft autosave + sender cache + invoice-number generation.
- **M3 (Week 3):** `<InvoiceDocument />` and PDF subcomponents + `<PDFPreview />` live iframe + multi-page pagination.
- **M4 (Week 4):** `Generate PDF` download flow + `Reset` + error handling + responsive polish + accessibility audit + cross-browser testing.
- **M5 (Week 5):** manual verification checklist + bug fixes + public launch.

No beta period since there's no analytics to measure one.
