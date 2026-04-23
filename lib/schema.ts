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
