import { jsPDF, GState } from "jspdf";
import { formatPrice } from "./utils";
import type { LetterheadConfig } from "./site-config";
import type { Order, OrderAddress } from "./types";

const MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const RIGHT = PAGE_WIDTH - MARGIN;
// Footer (bank/T&C, signature, footer text, computer-generated note) always
// starts at this fixed y so it reads as a proper reserved section instead of
// being crammed against whatever the content happened to end at.
const FOOTER_ZONE_TOP = 245;
const FOOTER_TEXT_Y = 285;
const GENERATED_NOTE_Y = 291;
// Content above this triggers a page break rather than overflowing into the footer zone.
const ITEMS_BREAK_Y = 230;

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

/** Opacity-scoped watermark draw, using jsPDF's documented save/restore graphics-state pattern. */
function drawWatermark(doc: jsPDF, watermark: ImageInfo | null, opacity: number) {
  if (!watermark) return;
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity }));
  const w = 100;
  const h = (watermark.height / watermark.width) * w;
  doc.addImage(watermark.dataUrl, (PAGE_WIDTH - w) / 2, (PAGE_HEIGHT - h) / 2, w, h);
  doc.restoreGraphicsState();
}

/** Company letterhead block (left) + title + invoice-meta block (right). Returns the y position below both. */
function drawHeader(doc: jsPDF, letterhead: LetterheadConfig, logo: ImageInfo | null, title: string, metaLines: string[]): number {
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, RIGHT, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let rightY = y + 6;
  for (const line of metaLines) { doc.text(line, RIGHT, rightY, { align: "right" }); rightY += 4; }

  const y2 = Math.max(leftY, rightY) + 4;
  doc.setDrawColor(20);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y2, RIGHT, y2);
  return y2 + 7;
}

function drawParties(doc: jsPDF, order: Order, y: number): number {
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

  let nextY = Math.max(billY, shipY) + 3;

  if (order.placeOfSupply) {
    doc.setFontSize(9);
    doc.text(`Place of Supply: ${order.placeOfSupply}${order.stateCode ? ` (${order.stateCode})` : ""}`, MARGIN, nextY);
    nextY += 6;
  }

  doc.setDrawColor(200);
  doc.line(MARGIN, nextY, RIGHT, nextY);
  return nextY + 6;
}

function drawItemsTable(doc: jsPDF, order: Order, y: number, watermark: ImageInfo | null, watermarkOpacity: number): number {
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
    if (y > ITEMS_BREAK_Y) {
      doc.addPage();
      drawWatermark(doc, watermark, watermarkOpacity);
      y = 20;
    }
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
  return y + 8;
}

function drawSummary(doc: jsPDF, rows: { label: string; value: string; bold?: boolean }[], y: number): number {
  for (const row of rows) {
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    if (row.bold) {
      doc.setDrawColor(200);
      doc.line(RIGHT - 60, y - 4, RIGHT, y - 4);
    }
    doc.text(row.label, RIGHT - 60, y);
    doc.text(row.value, RIGHT, y, { align: "right" });
    y += 6;
  }
  return y;
}

/**
 * Bank/T&C + signature + footer text + computer-generated note, pinned to a
 * fixed reserved zone near the bottom of the page (not wherever content
 * happens to end) so there's always proper breathing room above the edge.
 * Page-breaks first if the preceding content already runs into that zone.
 */
function drawFooter(doc: jsPDF, letterhead: LetterheadConfig, signature: ImageInfo | null, contentY: number, watermark: ImageInfo | null) {
  let y = FOOTER_ZONE_TOP;
  if (contentY > FOOTER_ZONE_TOP) {
    doc.addPage();
    drawWatermark(doc, watermark, letterhead.watermark_opacity);
    y = FOOTER_ZONE_TOP;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100);
  const notesWidth = 110;
  let notesY = y;
  if (letterhead.bank_details_text) {
    const lines = doc.splitTextToSize(letterhead.bank_details_text, notesWidth);
    doc.text(lines, MARGIN, notesY);
    notesY += lines.length * 3.5 + 2;
  }
  if (letterhead.terms_and_conditions) {
    const lines = doc.splitTextToSize(letterhead.terms_and_conditions, notesWidth);
    doc.text(lines, MARGIN, notesY);
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

  doc.setFontSize(8);
  doc.setTextColor(100);
  if (letterhead.footer_text) {
    doc.text(letterhead.footer_text, PAGE_WIDTH / 2, FOOTER_TEXT_Y, { align: "center" });
  }
  doc.setFontSize(7.5);
  doc.setTextColor(150);
  doc.text("This is a computer generated invoice.", PAGE_WIDTH / 2, GENERATED_NOTE_Y, { align: "center" });
}

async function loadLetterheadImages(letterhead: LetterheadConfig) {
  const [logo, signature, watermark] = await Promise.all([
    loadImage(letterhead.logo_url),
    loadImage(letterhead.signature_url),
    loadImage(letterhead.watermark_url),
  ]);
  return { logo, signature, watermark };
}

export interface TaxBreakdown {
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
}

/**
 * Tax Invoice: products/services + GST, sourced entirely from the order
 * snapshot and the site-wide Letterhead Configuration — no hardcoded values.
 */
export async function downloadTaxInvoicePdf(order: Order, letterhead: LetterheadConfig, tax: TaxBreakdown): Promise<void> {
  const { logo, signature, watermark } = await loadLetterheadImages(letterhead);
  const doc = new jsPDF();
  const orderShort = order.id.slice(0, 8).toUpperCase();

  drawWatermark(doc, watermark, letterhead.watermark_opacity);

  const metaLines = [
    `Invoice #: ${order.invoiceNumber ?? "—"}`,
    `Order #: ${orderShort}`,
    `Invoice Date: ${new Date(order.invoiceGeneratedAt ?? order.createdAt).toLocaleDateString()}`,
    `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    `Payment: ${order.paymentStatus}${order.paymentMethod ? ` (${order.paymentMethod})` : ""}`,
    ...(letterhead.gst_number ? [`GSTIN: ${letterhead.gst_number}`] : []),
    ...(letterhead.pan_number ? [`PAN: ${letterhead.pan_number}`] : []),
    ...(letterhead.cin_number ? [`CIN: ${letterhead.cin_number}`] : []),
  ];
  let y = drawHeader(doc, letterhead, logo, "TAX INVOICE", metaLines);

  y = drawParties(doc, order, y);
  y = drawItemsTable(doc, order, y, watermark, letterhead.watermark_opacity);

  const rows: { label: string; value: string; bold?: boolean }[] = [
    { label: "Subtotal", value: formatPrice(order.subtotal) },
  ];
  if (order.discountAmount > 0) rows.push({ label: "Discount", value: `-${formatPrice(order.discountAmount)}` });
  if (tax.cgstPercent > 0) rows.push({ label: `CGST (${tax.cgstPercent}%)`, value: formatPrice(tax.cgstAmount) });
  if (tax.sgstPercent > 0) rows.push({ label: `SGST (${tax.sgstPercent}%)`, value: formatPrice(tax.sgstAmount) });
  rows.push({ label: "Delivery", value: order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee) });
  const grandTotal = order.subtotal - order.discountAmount + tax.cgstAmount + tax.sgstAmount + order.deliveryFee;
  rows.push({ label: "Grand Total", value: formatPrice(grandTotal), bold: true });
  y = drawSummary(doc, rows, y);

  drawFooter(doc, letterhead, signature, y, watermark);

  doc.save(`tax-invoice-${orderShort}.pdf`);
}

/**
 * Platform Fee Invoice — separate document from the Tax Invoice, matching
 * common Indian GST practice of invoicing platform/commission fees as a
 * distinct supply from the goods/services themselves.
 */
export async function downloadPlatformFeeInvoicePdf(order: Order, letterhead: LetterheadConfig): Promise<void> {
  const { logo, signature, watermark } = await loadLetterheadImages(letterhead);
  const doc = new jsPDF();
  const orderShort = order.id.slice(0, 8).toUpperCase();

  drawWatermark(doc, watermark, letterhead.watermark_opacity);

  const metaLines = [
    `Order #: ${orderShort}`,
    `Invoice Date: ${new Date(order.invoiceGeneratedAt ?? order.createdAt).toLocaleDateString()}`,
    `Payment: ${order.paymentStatus}${order.paymentMethod ? ` (${order.paymentMethod})` : ""}`,
    ...(letterhead.gst_number ? [`GSTIN: ${letterhead.gst_number}`] : []),
    ...(letterhead.pan_number ? [`PAN: ${letterhead.pan_number}`] : []),
  ];
  let y = drawHeader(doc, letterhead, logo, "PLATFORM FEE INVOICE", metaLines);

  y = drawParties(doc, order, y);

  const rows: { label: string; value: string; bold?: boolean }[] = [
    { label: "Platform Fee", value: formatPrice(order.platformFee) },
    { label: "Grand Total", value: formatPrice(order.platformFee), bold: true },
  ];
  y = drawSummary(doc, rows, y + 4);

  drawFooter(doc, letterhead, signature, y, watermark);

  doc.save(`platform-fee-invoice-${orderShort}.pdf`);
}
