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
