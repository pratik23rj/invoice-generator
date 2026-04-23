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
