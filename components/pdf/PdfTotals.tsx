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
