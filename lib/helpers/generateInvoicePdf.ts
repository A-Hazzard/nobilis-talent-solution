import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type InvoiceData = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  notes?: string;
  bonusAmount?: number;
};

/**
 * Generates an invoice PDF on the frontend matching the original design
 * @param data - Invoice data
 * @returns PDF as Blob
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Blob> {
  try {
    // Create new PDF document
    const pdf = await PDFDocument.create();
    
    // Add page with Letter size
    const page = pdf.addPage([612, 792]); // 8.5" x 11"
    const { width, height } = page.getSize();
    
    // Embed fonts
    const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    
    // Define colors (matching original design)
    const BLACK = rgb(0, 0, 0);
    const DARK_GRAY = rgb(0.29, 0.29, 0.29); // #4a4a4a for table header
    const GRAY = rgb(0.4, 0.4, 0.4); // #666 for labels
    const LIGHT_GRAY = rgb(0.55, 0.55, 0.55); // #888 for invoice number
    const ACCENT_ORANGE = rgb(1, 0.42, 0.21); // #ff6b35 for balance due
    const TABLE_BG = rgb(0.98, 0.98, 0.98); // #f9f9f9 for table rows
    
    // Margins
    const MARGIN = 50;
    let yPosition = height - MARGIN;
    
    // === LOGO AND COMPANY INFO (LEFT SIDE) ===
    
    // Try to embed logo
    let logoHeight = 0;
    try {
      // Fetch logo from public assets
      const logoResponse = await fetch('/assets/logo-transparent.png');
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      const logoImage = await pdf.embedPng(logoArrayBuffer);
      
      // Scale logo to width of 120px (matching original design)
      const logoDims = logoImage.scale(120 / logoImage.width);
      
      page.drawImage(logoImage, {
        x: MARGIN,
        y: yPosition - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      
      logoHeight = logoDims.height + 15; // Logo height + margin
      yPosition -= logoHeight;
    } catch (error) {
      console.warn('Could not load logo:', error);
      // Continue without logo
    }
    
    // Company Info (under logo)
    const companyInfo = [
      'Nobilis Talent Solutions',
      'Kareem Payne',
      '3344 Cobb Parkway',
      'STE 200',
      'Acworth, GA, 30101',
      'Phone: +1 (678) 956-1146',
      'Email: support@nobilistalent.com'
    ];
    
    const infoFontSize = 9;
    for (let i = 0; i < companyInfo.length; i++) {
      page.drawText(companyInfo[i], {
        x: MARGIN,
        y: yPosition,
        size: infoFontSize,
        font: i === 0 ? helveticaBold : helvetica,
        color: LIGHT_GRAY,
      });
      yPosition -= 12;
    }
    
    // === INVOICE HEADER (RIGHT SIDE) ===
    const rightX = width - MARGIN - 150;
    let rightY = height - MARGIN;
    
    // INVOICE title (large, bold, with letter spacing)
    page.drawText('INVOICE', {
      x: rightX,
      y: rightY,
      size: 32,
      font: helveticaBold,
      color: BLACK,
    });
    rightY -= 25;
    
    // Invoice Number
    page.drawText(`#${data.invoiceNumber}`, {
      x: rightX,
      y: rightY,
      size: 14,
      font: helvetica,
      color: LIGHT_GRAY,
    });
    rightY -= 35;
    
    // Invoice Dates
    const invoiceDate = formatDate(data.issueDate);
    const dueDate = formatDate(data.dueDate);
    
    page.drawText('Date:', {
      x: rightX,
      y: rightY,
      size: 9,
      font: helvetica,
      color: GRAY,
    });
    
    page.drawText(invoiceDate, {
      x: rightX + 60,
      y: rightY,
      size: 9,
      font: helvetica,
      color: BLACK,
    });
    rightY -= 15;
    
    page.drawText('Due Date:', {
      x: rightX,
      y: rightY,
      size: 9,
      font: helvetica,
      color: GRAY,
    });
    
    page.drawText(dueDate, {
      x: rightX + 60,
      y: rightY,
      size: 9,
      font: helvetica,
      color: BLACK,
    });
    rightY -= 25;
    
    // Balance Due Box (with orange accent)
    const balanceBoxWidth = 150;
    const balanceBoxHeight = 50;
    
    // Orange left border
    page.drawRectangle({
      x: rightX,
      y: rightY - balanceBoxHeight,
      width: 4,
      height: balanceBoxHeight,
      color: ACCENT_ORANGE,
    });
    
    // Light gray background
    page.drawRectangle({
      x: rightX + 4,
      y: rightY - balanceBoxHeight,
      width: balanceBoxWidth - 4,
      height: balanceBoxHeight,
      color: rgb(0.97, 0.98, 0.98), // #f8f9fa
    });
    
    // Balance Due label
    page.drawText('Balance Due:', {
      x: rightX + 10,
      y: rightY - 15,
      size: 9,
      font: helvetica,
      color: GRAY,
    });
    
    // Balance amount
    page.drawText(formatCurrency(data.total), {
      x: rightX + 10,
      y: rightY - 35,
      size: 16,
      font: helveticaBold,
      color: BLACK,
    });
    
    // === BILL TO SECTION ===
    yPosition = height - MARGIN - 180; // Position after header
    
    page.drawText('Bill To:', {
      x: MARGIN,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: BLACK,
    });
    yPosition -= 20;
    
    page.drawText(data.clientName, {
      x: MARGIN,
      y: yPosition,
      size: 9,
      font: helvetica,
      color: LIGHT_GRAY,
    });
    yPosition -= 12;
    
    if (data.clientEmail) {
      page.drawText(data.clientEmail, {
        x: MARGIN,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: LIGHT_GRAY,
      });
    }
    
    yPosition -= 50;
    
    // === ITEMS TABLE ===
    // Table Header Background (dark gray matching original)
    const tableHeaderHeight = 25;
    page.drawRectangle({
      x: MARGIN,
      y: yPosition - tableHeaderHeight,
      width: width - (MARGIN * 2),
      height: tableHeaderHeight,
      color: DARK_GRAY,
    });
    
    // Table Headers (white text on dark background)
    const tableY = yPosition - 10;
    page.drawText('Item', {
      x: MARGIN + 10,
      y: tableY,
      size: 9,
      font: helveticaBold,
      color: rgb(1, 1, 1), // White
    });
    
    page.drawText('Quantity', {
      x: width - MARGIN - 220,
      y: tableY,
      size: 9,
      font: helveticaBold,
      color: rgb(1, 1, 1), // White
    });
    
    page.drawText('Rate', {
      x: width - MARGIN - 130,
      y: tableY,
      size: 9,
      font: helveticaBold,
      color: rgb(1, 1, 1), // White
    });
    
    page.drawText('Amount', {
      x: width - MARGIN - 60,
      y: tableY,
      size: 9,
      font: helveticaBold,
      color: rgb(1, 1, 1), // White
    });
    
    yPosition -= tableHeaderHeight + 5;
    
    // Table Items (with alternating row backgrounds)
    let itemIndex = 0;
    for (const item of data.items) {
      const rowHeight = 25;
      
      // Alternating row background
      if (itemIndex % 2 === 1) {
        page.drawRectangle({
          x: MARGIN,
          y: yPosition - rowHeight + 5,
          width: width - (MARGIN * 2),
          height: rowHeight,
          color: TABLE_BG,
        });
      }
      
      // Item description (truncate if too long)
      const maxDescLength = 60;
      const desc = item.description.length > maxDescLength 
        ? item.description.substring(0, maxDescLength) + '...' 
        : item.description;
      
      page.drawText(desc, {
        x: MARGIN + 10,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: BLACK,
      });
      
      // Quantity (centered)
      page.drawText(item.quantity.toString(), {
        x: width - MARGIN - 215,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: BLACK,
      });
      
      // Unit Price (right aligned)
      const rateText = formatCurrency(item.unitPrice);
      const rateWidth = helvetica.widthOfTextAtSize(rateText, 9);
      page.drawText(rateText, {
        x: width - MARGIN - 130 - rateWidth,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: BLACK,
      });
      
      // Total (right aligned)
      const totalText = formatCurrency(item.total);
      const totalWidth = helvetica.widthOfTextAtSize(totalText, 9);
      page.drawText(totalText, {
        x: width - MARGIN - 10 - totalWidth,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: BLACK,
      });
      
      yPosition -= rowHeight;
      itemIndex++;
      
      // Check if we need a new page
      if (yPosition < 150 && itemIndex < data.items.length) {
        pdf.addPage([612, 792]);
        yPosition = height - MARGIN;
      }
    }
    
    yPosition -= 10;
    
    // === TOTALS SECTION ===
    const totalsX = width - MARGIN - 200;
    const totalsValueX = width - MARGIN - 80;
    
    // Subtotal
    page.drawText('Subtotal:', {
      x: totalsX,
      y: yPosition,
      size: 9,
      font: helvetica,
      color: BLACK,
    });
    
    const subtotalText = formatCurrency(data.subtotal);
    const subtotalWidth = helvetica.widthOfTextAtSize(subtotalText, 9);
    page.drawText(subtotalText, {
      x: totalsValueX - subtotalWidth,
      y: yPosition,
      size: 9,
      font: helveticaBold,
      color: BLACK,
    });
    yPosition -= 15;
    
    // Bonus Amount (if applicable - matching original design)
    if (data.bonusAmount && data.bonusAmount > 0) {
      page.drawText('Bonus Amount:', {
        x: totalsX,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: BLACK,
      });
      
      const bonusText = formatCurrency(data.bonusAmount);
      const bonusWidth = helvetica.widthOfTextAtSize(bonusText, 9);
      page.drawText(bonusText, {
        x: totalsValueX - bonusWidth,
        y: yPosition,
        size: 9,
        font: helveticaBold,
        color: BLACK,
      });
      yPosition -= 15;
    }
    
    // Top border for total row
    yPosition -= 5;
    page.drawLine({
      start: { x: totalsX - 10, y: yPosition },
      end: { x: width - MARGIN, y: yPosition },
      color: BLACK,
      thickness: 2,
    });
    yPosition -= 15;
    
    // Total
    page.drawText('Total:', {
      x: totalsX,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: BLACK,
    });
    
    const totalText = formatCurrency(data.total);
    const totalWidth = helveticaBold.widthOfTextAtSize(totalText, 10);
    page.drawText(totalText, {
      x: totalsValueX - totalWidth,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: BLACK,
    });
    
    // === NOTES SECTION ===
    if (data.notes) {
      yPosition -= 40;
      
      page.drawText('Notes:', {
        x: MARGIN,
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: GRAY,
      });
      yPosition -= 15;
      
      // Wrap notes text
      const maxWidth = width - (MARGIN * 2);
      const wrappedNotes = wrapText(data.notes, maxWidth, helvetica, 9);
      
      for (const line of wrappedNotes) {
        if (yPosition < 50) break; // Don't overflow
        
        page.drawText(line, {
          x: MARGIN,
          y: yPosition,
          size: 9,
          font: helvetica,
          color: BLACK,
        });
        yPosition -= 12;
      }
    }
    
    // === FOOTER ===
    page.drawText('Thank you for your business!', {
      x: width / 2 - 70,
      y: 30,
      size: 10,
      font: helveticaBold,
      color: GRAY,
    });
    
    // Save and return as Blob
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(
      `Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Wraps text to fit within a specified width
 */
function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Formats currency values
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
}

/**
 * Formats date strings
 */
function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

