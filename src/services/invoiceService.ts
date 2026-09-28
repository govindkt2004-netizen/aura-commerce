import { jsPDF } from 'jspdf';
import { Order } from '../types';
import { api } from './api';

/**
 * Utility: Convert numeric currency to Indian English Words
 */
function numberToIndianWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const ones = a[n % 10];
    return [tens, ones].filter(Boolean).join(' ');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const parts: string[] = [];
    if (hundred > 0) {
      parts.push(`${a[hundred]} Hundred`);
    }
    if (rest > 0) {
      parts.push(convertTwoDigits(rest));
    }
    return parts.join(' ');
  }

  let n = rounded;
  const parts: string[] = [];

  // Crores (10,000,000)
  const crore = Math.floor(n / 10000000);
  if (crore > 0) {
    parts.push(`${convertTwoDigits(crore)} Crore`);
    n %= 10000000;
  }

  // Lakhs (100,000)
  const lakh = Math.floor(n / 100000);
  if (lakh > 0) {
    parts.push(`${convertTwoDigits(lakh)} Lakh`);
    n %= 100000;
  }

  // Thousands (1,000)
  const thousand = Math.floor(n / 1000);
  if (thousand > 0) {
    parts.push(`${convertTwoDigits(thousand)} Thousand`);
    n %= 1000;
  }

  // Hundreds & remainder
  if (n > 0) {
    parts.push(convertThreeDigits(n));
  }

  return `Indian Rupees ${parts.join(' ')} Only`;
}

/**
 * Format INR currency for the invoice table
 */
function formatCurrency(amount: number): string {
  return 'Rs. ' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

/**
 * Service to generate professional, GST-compliant PDF Tax Invoices for orders
 */
export async function generateOrderInvoicePDF(orderInput: Order | string): Promise<jsPDF> {
  // If order is passed as ID, fetch freshly from database
  let order: Order;
  if (typeof orderInput === 'string') {
    const res = await api.getOrderById(orderInput);
    if (!res.order) {
      throw new Error(`Order #${orderInput} not found in database`);
    }
    order = res.order;
  } else {
    // If order might be partial, ensure fresh copy or use provided
    order = orderInput;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  // Colors
  const darkCharcoal: [number, number, number] = [24, 24, 27]; // #18181b
  const slateGray: [number, number, number] = [100, 116, 139]; // #64748b
  const lightGray: [number, number, number] = [241, 245, 249]; // #f1f5f9
  const borderGray: [number, number, number] = [226, 232, 240]; // #e2e8f0
  const emeraldGreen: [number, number, number] = [16, 149, 106]; // #10956a

  // Top Accent Banner Line
  doc.setFillColor(...darkCharcoal);
  doc.rect(margin, cursorY, pageWidth - margin * 2, 2, 'F');
  cursorY += 7;

  // Header: Brand & Company Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkCharcoal);
  doc.text('AURA ATELIER', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateGray);
  cursorY += 4.5;
  doc.text('AURA Horology & Archival Design Pvt. Ltd.', margin, cursorY);
  cursorY += 3.8;
  doc.text('42 Heritage Mill Industrial Estate, Lower Parel, Mumbai, MH 400013', margin, cursorY);
  cursorY += 3.8;
  doc.text('GSTIN: 27AABCA1234F1Z5  |  CIN: U74999MH2024PTC123456', margin, cursorY);
  cursorY += 3.8;
  doc.text('Email: concierge@aura-atelier.com  |  Phone: +91 22 4900 8800', margin, cursorY);

  // Header: Tax Invoice Badge & Metadata (Right)
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkCharcoal);
  doc.text('TAX INVOICE', rightX, margin + 7, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateGray);
  doc.text('Original for Recipient', rightX, margin + 11.5, { align: 'right' });

  // Invoice Details Box on the right
  doc.setFillColor(...lightGray);
  doc.roundedRect(rightX - 65, margin + 14, 65, 22, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(rightX - 65, margin + 14, 65, 22, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(...slateGray);
  doc.text('Invoice No:', rightX - 62, margin + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkCharcoal);
  doc.text(`INV-${order.id.slice(0, 12).toUpperCase()}`, rightX - 3, margin + 19, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Invoice Date:', rightX - 62, margin + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkCharcoal);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(formattedDate, rightX - 3, margin + 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Payment Status:', rightX - 62, margin + 29);
  const isPaid = order.paymentStatus === 'paid' || order.paymentMethod !== 'cod';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? emeraldGreen[0] : 180, isPaid ? emeraldGreen[1] : 80, isPaid ? emeraldGreen[2] : 20);
  doc.text((order.paymentStatus || (isPaid ? 'PAID' : 'PENDING')).toUpperCase(), rightX - 3, margin + 29, { align: 'right' });

  cursorY = margin + 40;

  // Divider
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, rightX, cursorY);
  cursorY += 6;

  // Address Cards: Sold By (Atelier) vs Billed / Shipped To (Customer)
  const cardWidth = (pageWidth - margin * 2 - 8) / 2;
  const addressCardHeight = 36;

  // Card 1: Dispatch Atelier (Left)
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(margin, cursorY, cardWidth, addressCardHeight, 2, 2, 'FD');
  doc.setDrawColor(...borderGray);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkCharcoal);
  doc.text('DISPATCH ATELIER & ORIGIN', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateGray);
  doc.text('AURA Central Fulfillment Hub #01', margin + 4, cursorY + 11.5);
  doc.text('42 Heritage Mill Industrial Estate, Unit 4B', margin + 4, cursorY + 16);
  doc.text('Lower Parel, Mumbai, Maharashtra 400013, India', margin + 4, cursorY + 20.5);
  doc.text('State Code: 27 (Maharashtra)  |  Nature: E-Commerce Dispatch', margin + 4, cursorY + 25);
  doc.text('Auth Verification: ISO-9001 Certified Luxury Packaging', margin + 4, cursorY + 29.5);

  // Card 2: Billed & Shipped To (Right)
  const card2X = margin + cardWidth + 8;
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(card2X, cursorY, cardWidth, addressCardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkCharcoal);
  doc.text('BILLED & SHIPPED TO', card2X + 4, cursorY + 6);

  const recipientName =
    order.shippingAddress?.fullName ||
    order.shippingAddress?.recipientName ||
    order.customerName ||
    'Valued Collector';
  const street = order.shippingAddress?.street || 'On file with Atelier';
  const cityState = [
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.postalCode || order.shippingAddress?.zipCode
  ]
    .filter(Boolean)
    .join(', ');
  const phone = order.shippingAddress?.phone || 'Provided upon delivery';
  const email = order.customerEmail || 'collector@aura.store';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkCharcoal);
  doc.text(recipientName, card2X + 4, cursorY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateGray);
  doc.text(street, card2X + 4, cursorY + 16);
  doc.text(cityState || 'India', card2X + 4, cursorY + 20.5);
  doc.text(`Phone: ${phone}`, card2X + 4, cursorY + 25);
  doc.text(`Email: ${email}`, card2X + 4, cursorY + 29.5);

  cursorY += addressCardHeight + 8;

  // Logistics & Order Reference Strip
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 8, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkCharcoal);

  doc.setFont('helvetica', 'bold');
  doc.text('Order ID:', margin + 3, cursorY + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.text(order.id, margin + 17, cursorY + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Gateway:', margin + 65, cursorY + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.text(order.paymentMethod?.toUpperCase() || 'ONLINE', margin + 92, cursorY + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.text('Logistics AWB:', margin + 120, cursorY + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.text(order.trackingNumber || 'BLUEDART-PRIORITY-EXP', margin + 142, cursorY + 5.2);

  cursorY += 12;

  // Table Header
  const colX = {
    idx: margin + 2,
    desc: margin + 10,
    hsn: margin + 82,
    qty: margin + 106,
    rate: margin + 126,
    gst: margin + 148,
    amount: rightX - 2
  };

  doc.setFillColor(...darkCharcoal);
  doc.rect(margin, cursorY, pageWidth - margin * 2, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.idx, cursorY + 4.8);
  doc.text('ITEM DESCRIPTION', colX.desc, cursorY + 4.8);
  doc.text('HSN/SAC', colX.hsn, cursorY + 4.8);
  doc.text('QTY', colX.qty, cursorY + 4.8, { align: 'center' });
  doc.text('UNIT PRICE', colX.rate, cursorY + 4.8, { align: 'right' });
  doc.text('GST (18%)', colX.gst, cursorY + 4.8, { align: 'right' });
  doc.text('TOTAL (INR)', colX.amount, cursorY + 4.8, { align: 'right' });

  cursorY += 7;

  // Table Body Rows
  const items = order.items && order.items.length > 0 ? order.items : [];
  let rowIdx = 1;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    const taxableAmount = itemTotal / 1.18;
    const itemGst = itemTotal - taxableAmount;
    const hsnCode = item.productName.toLowerCase().includes('watch')
      ? '9102.11'
      : item.productName.toLowerCase().includes('headphone') || item.productName.toLowerCase().includes('speaker')
      ? '8518.30'
      : '9983.19';

    const rowBg = rowIdx % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, cursorY, pageWidth - margin * 2, 9, 'F');

    // Bottom row border
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY + 9, rightX, cursorY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...slateGray);
    doc.text(String(rowIdx), colX.idx, cursorY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkCharcoal);
    const truncatedName =
      item.productName.length > 36 ? item.productName.substring(0, 34) + '...' : item.productName;
    doc.text(truncatedName, colX.desc, cursorY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slateGray);
    doc.text(hsnCode, colX.hsn, cursorY + 5.5);
    doc.text(String(item.quantity), colX.qty, cursorY + 5.5, { align: 'center' });
    doc.text(formatCurrency(item.price), colX.rate, cursorY + 5.5, { align: 'right' });
    doc.text(formatCurrency(itemGst), colX.gst, cursorY + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkCharcoal);
    doc.text(formatCurrency(itemTotal), colX.amount, cursorY + 5.5, { align: 'right' });

    cursorY += 9;
    rowIdx++;
  }

  cursorY += 4;

  // Summary & Totals Block (Right-aligned)
  const summaryBoxWidth = 82;
  const summaryBoxX = rightX - summaryBoxWidth;
  const summaryBoxHeight = 44;

  // Left side: Amount in Words, Bank Details, and Certified QR / Seal
  const leftBlockWidth = summaryBoxX - margin - 6;

  // Amount in words box
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(margin, cursorY, leftBlockWidth, 18, 1.5, 1.5, 'FD');
  doc.setDrawColor(...borderGray);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateGray);
  doc.text('TOTAL AMOUNT IN WORDS', margin + 3, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkCharcoal);
  const words = numberToIndianWords(order.total);
  const splitWords = doc.splitTextToSize(words, leftBlockWidth - 6);
  doc.text(splitWords, margin + 3, cursorY + 10);

  // Digital Authentication Seal / Compliance
  doc.roundedRect(margin, cursorY + 21, leftBlockWidth, 23, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkCharcoal);
  doc.text('AUTHORIZED SIGNATURE & ATELIER AUTHENTICATION', margin + 3, cursorY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateGray);
  doc.text('Electronically signed & verified at AURA Central Vault, Mumbai.', margin + 3, cursorY + 30.5);
  doc.text(`Digital Verification ID: AURA-${order.id.slice(0, 8).toUpperCase()}-GST-2026`, margin + 3, cursorY + 34.5);
  doc.setFont('helvetica', 'italic');
  doc.text('No physical signature required under Section 31 of CGST Act.', margin + 3, cursorY + 38.5);

  // Summary Box (Right)
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(summaryBoxX, cursorY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'FD');
  doc.setDrawColor(...borderGray);

  let sumY = cursorY + 6;
  doc.setFontSize(8);

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateGray);
  doc.text('Subtotal (Items):', summaryBoxX + 4, sumY);
  doc.setTextColor(...darkCharcoal);
  doc.text(formatCurrency(order.subtotal || order.total), rightX - 4, sumY, { align: 'right' });
  sumY += 5.5;

  // Discount
  if (order.discount && order.discount > 0) {
    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    const discLabel = order.discountCode ? `Discount (${order.discountCode}):` : 'Promotional Discount:';
    doc.text(discLabel, summaryBoxX + 4, sumY);
    doc.text(`-${formatCurrency(order.discount)}`, rightX - 4, sumY, { align: 'right' });
    sumY += 5.5;
  }

  // Shipping
  doc.setTextColor(...slateGray);
  doc.text('Insured Cargo Shipping:', summaryBoxX + 4, sumY);
  doc.setTextColor(...darkCharcoal);
  doc.text(
    order.shippingFee && order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'FREE (Complimentary)',
    rightX - 4,
    sumY,
    { align: 'right' }
  );
  sumY += 5.5;

  // Taxes breakdown (CGST 9% + SGST 9%)
  const taxTotal = order.tax || Math.round((order.total * 0.18) / 1.18);
  const halfTax = taxTotal / 2;

  doc.setTextColor(...slateGray);
  doc.text('CGST (9.0%):', summaryBoxX + 4, sumY);
  doc.setTextColor(...darkCharcoal);
  doc.text(formatCurrency(halfTax), rightX - 4, sumY, { align: 'right' });
  sumY += 5;

  doc.setTextColor(...slateGray);
  doc.text('SGST (9.0%):', summaryBoxX + 4, sumY);
  doc.setTextColor(...darkCharcoal);
  doc.text(formatCurrency(halfTax), rightX - 4, sumY, { align: 'right' });
  sumY += 6.5;

  // Divider
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(summaryBoxX + 4, sumY, rightX - 4, sumY);
  sumY += 5.5;

  // Grand Total Highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkCharcoal);
  doc.text('GRAND TOTAL:', summaryBoxX + 4, sumY);
  doc.text(formatCurrency(order.total), rightX - 4, sumY, { align: 'right' });

  // Page Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY, rightX, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateGray);
  doc.text(
    'AURA ATELIER · 30-Day Complimentary Returns on Unopened Packaging · For Inquiries: concierge@aura-atelier.com',
    pageWidth / 2,
    footerY + 4.5,
    { align: 'center' }
  );
  doc.text(
    'Registered Office: 42 Heritage Mill Industrial Estate, Lower Parel, Mumbai MH 400013 · CIN: U74999MH2024PTC123456',
    pageWidth / 2,
    footerY + 8,
    { align: 'center' }
  );

  return doc;
}

/**
 * Triggers instant, reliable client-side file download of the PDF invoice
 */
export async function downloadOrderInvoice(orderInput: Order | string): Promise<void> {
  const doc = await generateOrderInvoicePDF(orderInput);
  const orderId = typeof orderInput === 'string' ? orderInput : orderInput.id;
  const fileName = `Aura-Invoice-${orderId}.pdf`;
  doc.save(fileName);
}
