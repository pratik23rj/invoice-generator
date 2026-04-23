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
