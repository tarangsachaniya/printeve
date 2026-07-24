import { jsPDF, GState } from "jspdf";
import { formatPrice } from "./utils";
import type { LetterheadConfig } from "./site-config";
import type { Order, OrderAddress } from "./types";

const MARGIN = 14;
const PAGE_WIDTH = 210;
const RIGHT = PAGE_WIDTH - MARGIN;

interface ImageInfo {
  dataUrl: string;
  width: number;
  height: number;
}

async function loadImage(url: string | null | undefined): Promise<ImageInfo | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function addImageFit(doc: jsPDF, img: ImageInfo, x: number, y: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  doc.addImage(img.dataUrl, x, y, w, h);
  return { w, h };
}

function formatAddressLines(address: OrderAddress): string[] {
  const line1 = [address.houseNumber, address.floor, address.towerBlock].filter(Boolean).join(", ");
  return [
    [line1, address.line1].filter(Boolean).join(", "),
    address.line2 || null,
    address.landmark ? `Near ${address.landmark}` : null,
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter(Boolean) as string[];
}

/**
 * Full Indian tax-invoice PDF, sourced entirely from the order snapshot
 * (Phase 1-3) and the site-wide Letterhead Configuration (Phase 4) — no
 * hardcoded company/customer values. Uses jsPDF (already a dependency).
 */
export async function downloadInvoicePdf(order: Order, letterhead: LetterheadConfig): Promise<void> {
  const [logo, signature, watermark] = await Promise.all([
    loadImage(letterhead.logo_url),
    loadImage(letterhead.signature_url),
    loadImage(letterhead.watermark_url),
  ]);

  const doc = new jsPDF();
  const orderShort = order.id.slice(0, 8).toUpperCase();

  if (watermark) {
    doc.setGState(new GState({ opacity: letterhead.watermark_opacity }));
    const w = 100;
    const h = (watermark.height / watermark.width) * w;
    doc.addImage(watermark.dataUrl, (PAGE_WIDTH - w) / 2, (297 - h) / 2, w, h);
    doc.setGState(new GState({ opacity: 1 }));
  }

  let y = 18;
  let textX = MARGIN;
  if (logo) {
    const { w } = addImageFit(doc, logo, MARGIN, y - 6, 20, 20);
    textX = MARGIN + w + 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(letterhead.company_name || "Priinteve Innovations", textX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let leftY = y + 5;
  if (letterhead.tagline) { doc.text(letterhead.tagline, textX, leftY); leftY += 4; }
  for (const line of [letterhead.address_line1, letterhead.address_line2].filter(Boolean)) {
    doc.text(line, textX, leftY); leftY += 4;
  }
  const cityLine = [letterhead.city, letterhead.state, letterhead.pincode].filter(Boolean).join(", ");
  if (cityLine) { doc.text(cityLine, textX, leftY); leftY += 4; }
  const phones = [letterhead.phone_primary, letterhead.phone_secondary].filter(Boolean).join(", ");
  if (phones) { doc.text(`Ph: ${phones}`, textX, leftY); leftY += 4; }
  if (letterhead.email) { doc.text(letterhead.email, textX, leftY); leftY += 4; }
  if (letterhead.website) { doc.text(letterhead.website, textX, leftY); leftY += 4; }

  let rightY = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TAX INVOICE", RIGHT, rightY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rightY += 6;
  const rightLines = [
    `Invoice #: ${order.invoiceNumber ?? "—"}`,
    `Order #: ${orderShort}`,
    `Invoice Date: ${new Date(order.invoiceGeneratedAt ?? order.createdAt).toLocaleDateString()}`,
    `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    `Payment: ${order.paymentStatus}${order.paymentMethod ? ` (${order.paymentMethod})` : ""}`,
    ...(letterhead.gst_number ? [`GSTIN: ${letterhead.gst_number}`] : []),
    ...(letterhead.pan_number ? [`PAN: ${letterhead.pan_number}`] : []),
    ...(letterhead.cin_number ? [`CIN: ${letterhead.cin_number}`] : []),
  ];
  for (const line of rightLines) { doc.text(line, RIGHT, rightY, { align: "right" }); rightY += 4; }

  y = Math.max(leftY, rightY) + 4;
  doc.setDrawColor(20);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, RIGHT, y);
  y += 7;

  const colWidth = (RIGHT - MARGIN) / 2;
  const billing = order.billingAddress ?? order.shippingAddress;
  const shipping = order.shippingAddress;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bill To", MARGIN, y);
  doc.text("Ship To", MARGIN + colWidth, y);
  doc.setFont("helvetica", "normal");
  let billY = y + 5;
  let shipY = y + 5;
  const billLines = [
    order.companyName,
    order.customerName,
    ...(billing ? formatAddressLines(billing) : []),
    order.customerPhone,
    ...(order.hasGst && order.gstNumber ? [`GSTIN: ${order.gstNumber}`] : []),
  ].filter(Boolean) as string[];
  for (const line of billLines) { doc.text(line, MARGIN, billY, { maxWidth: colWidth - 4 }); billY += 4; }

  const shipLines = shipping
    ? [shipping.fullName, ...formatAddressLines(shipping), shipping.phone].filter(Boolean) as string[]
    : [];
  for (const line of shipLines) { doc.text(line, MARGIN + colWidth, shipY, { maxWidth: colWidth - 4 }); shipY += 4; }

  y = Math.max(billY, shipY) + 3;

  if (order.placeOfSupply) {
    doc.setFontSize(9);
    doc.text(`Place of Supply: ${order.placeOfSupply}${order.stateCode ? ` (${order.stateCode})` : ""}`, MARGIN, y);
    y += 6;
  }

  doc.setDrawColor(200);
  doc.line(MARGIN, y, RIGHT, y);
  y += 6;

  // Items table (manual — no autotable plugin, mirrors the existing hand-rolled style).
  const cols = { idx: MARGIN, item: MARGIN + 8, qty: 130, rate: 150, amount: RIGHT };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("#", cols.idx, y);
  doc.text("Item", cols.item, y);
  doc.text("Qty", cols.qty, y);
  doc.text("Rate", cols.rate, y);
  doc.text("Amount", cols.amount, y, { align: "right" });
  y += 2;
  doc.setDrawColor(20);
  doc.line(MARGIN, y, RIGHT, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  order.items.forEach((item, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.text(String(idx + 1), cols.idx, y);
    doc.text(item.productName ?? item.productType, cols.item, y, { maxWidth: cols.qty - cols.item - 4 });
    doc.text(String(item.quantity), cols.qty, y);
    doc.text(formatPrice(item.unitPrice), cols.rate, y);
    doc.text(formatPrice(item.totalPrice), cols.amount, y, { align: "right" });
    y += 5;
    const options = item.selectedOptions.map((o) => `${o.option_label}: ${o.value_label}`).join(", ");
    if (options) {
      doc.setFontSize(7.5);
      doc.setTextColor(120);
      doc.text(options, cols.item, y, { maxWidth: cols.qty - cols.item - 4 });
      doc.setFontSize(9);
      doc.setTextColor(0);
      y += 4;
    }
    y += 1;
  });

  doc.setDrawColor(200);
  doc.line(MARGIN, y, RIGHT, y);
  y += 8;

  function summaryRow(label: string, value: string, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, RIGHT - 60, y);
    doc.text(value, RIGHT, y, { align: "right" });
    y += 6;
  }
  summaryRow("Subtotal", formatPrice(order.subtotal));
  if (order.discountAmount > 0) summaryRow("Discount", `-${formatPrice(order.discountAmount)}`);
  if (order.platformFee > 0) summaryRow("Platform Fee", formatPrice(order.platformFee));
  summaryRow("Delivery", order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee));
  doc.setDrawColor(200);
  doc.line(RIGHT - 60, y - 4, RIGHT, y - 4);
  summaryRow("Grand Total", formatPrice(order.total), true);

  y += 10;
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100);
  const notesX = MARGIN;
  const notesWidth = 110;
  let notesY = y;
  if (letterhead.bank_details_text) {
    const lines = doc.splitTextToSize(letterhead.bank_details_text, notesWidth);
    doc.text(lines, notesX, notesY);
    notesY += lines.length * 3.5 + 2;
  }
  if (letterhead.terms_and_conditions) {
    const lines = doc.splitTextToSize(letterhead.terms_and_conditions, notesWidth);
    doc.text(lines, notesX, notesY);
    notesY += lines.length * 3.5;
  }

  let sigY = y;
  if (signature) {
    const { h } = addImageFit(doc, signature, RIGHT - 35, sigY - 8, 35, 12);
    sigY += h + 2;
  } else {
    sigY += 12;
  }
  doc.setDrawColor(100);
  doc.line(RIGHT - 45, sigY, RIGHT, sigY);
  sigY += 4;
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(letterhead.signature_name || "Authorized Signatory", RIGHT, sigY, { align: "right" });
  if (letterhead.signature_designation) {
    sigY += 4;
    doc.setTextColor(100);
    doc.text(letterhead.signature_designation, RIGHT, sigY, { align: "right" });
  }

  const finalY = Math.max(notesY, sigY, 280);
  doc.setFontSize(8);
  doc.setTextColor(100);
  if (letterhead.footer_text) {
    doc.text(letterhead.footer_text, PAGE_WIDTH / 2, Math.min(finalY, 285), { align: "center" });
  }
  doc.setFontSize(7.5);
  doc.setTextColor(150);
  doc.text("This is a computer generated invoice.", PAGE_WIDTH / 2, 292, { align: "center" });

  doc.save(`invoice-${orderShort}.pdf`);
}
