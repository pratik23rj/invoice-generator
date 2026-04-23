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
