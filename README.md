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
```
pnpm install
pnpm dev           # http://localhost:3000
```

## Production build
```
pnpm build
pnpm start
```

## Deploy
Built for static export (`next.config.mjs` sets `output: "export"`). Push to a Vercel project; no configuration needed. The `out/` directory after `pnpm build` contains the static site.

## Design & spec
See `docs/superpowers/specs/2026-04-20-invoice-generator-design.md` for the v1 design and `docs/superpowers/plans/2026-04-20-invoice-generator.md` for the implementation plan.
