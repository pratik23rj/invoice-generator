import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/schema";
import { pdfStyles as s } from "./styles";
import { registerPdfFonts } from "./registerFonts";
import { PdfHeader } from "./PdfHeader";
import { PdfBillTo } from "./PdfBillTo";
import { PdfLineItemsTable } from "./PdfLineItemsTable";

registerPdfFonts();

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader invoice={invoice} />
        <PdfBillTo invoice={invoice} />
        <PdfLineItemsTable invoice={invoice} />

        {/* Totals arrive in Task 18 */}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
