import { jsPDF } from "jspdf";
import { formatPrice } from "./utils";

interface ServiceBillInput {
  orderId: string;
  createdAt: string;
  subtotal: number;
  discountAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceTotal: number;
}

interface PlatformFeeBillInput {
  orderId: string;
  createdAt: string;
  platformFee: number;
}

function newInvoiceDoc(title: string, orderId: string, createdAt: string): jsPDF {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Order #${orderId.slice(0, 8).toUpperCase()}`, 14, 28);
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 14, 34);
  doc.setDrawColor(200);
  doc.line(14, 38, 196, 38);
  return doc;
}

function row(doc: jsPDF, y: number, label: string, value: string, bold = false): number {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(11);
  doc.text(label, 14, y);
  doc.text(value, 196, y, { align: "right" });
  return y + 8;
}

export function downloadServiceBillPdf(input: ServiceBillInput): void {
  const doc = newInvoiceDoc("Service Bill", input.orderId, input.createdAt);
  let y = 48;
  y = row(doc, y, "Subtotal", formatPrice(input.subtotal));
  if (input.discountAmount > 0) {
    y = row(doc, y, "Discount", `-${formatPrice(input.discountAmount)}`);
  }
  if (input.cgstPercent > 0) {
    y = row(doc, y, `CGST (${input.cgstPercent}%)`, formatPrice(input.cgstAmount));
  }
  if (input.sgstPercent > 0) {
    y = row(doc, y, `SGST (${input.sgstPercent}%)`, formatPrice(input.sgstAmount));
  }
  doc.setDrawColor(200);
  doc.line(14, y - 4, 196, y - 4);
  row(doc, y + 2, "Service Total", formatPrice(input.serviceTotal), true);
  doc.save(`service-bill-${input.orderId.slice(0, 8)}.pdf`);
}

export function downloadPlatformFeeBillPdf(input: PlatformFeeBillInput): void {
  const doc = newInvoiceDoc("Platform Fee Bill", input.orderId, input.createdAt);
  let y = 48;
  y = row(doc, y, "Platform Fee", formatPrice(input.platformFee));
  doc.setDrawColor(200);
  doc.line(14, y - 4, 196, y - 4);
  row(doc, y + 2, "Platform Fee Total", formatPrice(input.platformFee), true);
  doc.save(`platform-fee-bill-${input.orderId.slice(0, 8)}.pdf`);
}
