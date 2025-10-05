import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
 * Generates invoice HTML matching the original Puppeteer design
 */
function generateInvoiceHTML(data: InvoiceData): string {
  const invoiceDate = new Date(data.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const dueDate = new Date(data.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const logoUrl = window.location.origin + '/assets/logo-transparent.png';

  return `
    <div class="invoice-container" style="width: 800px; padding: 20px; font-family: Arial, sans-serif; color: #333; background: #fff;">
        <!-- Header Section -->
        <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px;">
            <div class="logo-section" style="flex: 1;">
                <img src="${logoUrl}" alt="Company Logo" crossorigin="anonymous" style="width: 120px; height: auto; margin-bottom: 15px; display: block;" />
                <div class="company-info" style="font-size: 11px; line-height: 1.4; color: #555;">
                    <strong>Nobilis Talent Solutions</strong><br>
                    Kareem Payne<br>
                    3344 Cobb Parkway<br>
                    STE 200<br>
                    Acworth, GA, 30101<br>
                    Phone: +1 (678) 956-1146<br>
                    Email: support@nobilis-talent.com
                </div>
            </div>
            
            <div class="invoice-header" style="flex: 1; text-align: right;">
                <div class="invoice-title" style="font-size: 32px; font-weight: bold; color: #333; margin-bottom: 5px; letter-spacing: 2px;">INVOICE</div>
                <div class="invoice-number" style="font-size: 14px; color: #888; margin-bottom: 20px;">#${data.invoiceNumber}</div>
                
                <div class="invoice-dates" style="text-align: right; font-size: 11px; line-height: 1.6;">
                    <div class="date-row" style="margin-bottom: 5px;">
                        <span class="date-label" style="display: inline-block; width: 60px; text-align: left; color: #666;">Date:</span>
                        <span>${invoiceDate}</span>
                    </div>
                    <div class="date-row" style="margin-bottom: 5px;">
                        <span class="date-label" style="display: inline-block; width: 60px; text-align: left; color: #666;">Due Date:</span>
                        <span>${dueDate}</span>
                    </div>
                </div>
                
                <div class="balance-due" style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #ff6b35;">
                    <div class="balance-label" style="font-size: 11px; color: #666; margin-bottom: 2px;">Balance Due:</div>
                    <div class="balance-amount" style="font-size: 16px; font-weight: bold; color: #333;">$${data.total.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</div>
                </div>
            </div>
        </div>
        
        <!-- Billing Section -->
        <div class="billing-section" style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div class="bill-to" style="flex: 1;">
                <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 10px; color: #333;">Bill To:</h3>
                <div class="client-details" style="font-size: 11px; line-height: 1.5; color: #555;">
                    ${data.clientName}<br>
                    ${data.clientEmail || ''}
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
            <thead>
                <tr>
                    <th style="background-color: #4a4a4a; color: white; padding: 12px 15px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase;">Item</th>
                    <th class="center" style="background-color: #4a4a4a; color: white; padding: 12px 15px; text-align: center; font-size: 11px; font-weight: bold; text-transform: uppercase;">Quantity</th>
                    <th class="right" style="background-color: #4a4a4a; color: white; padding: 12px 15px; text-align: right; font-size: 11px; font-weight: bold; text-transform: uppercase;">Rate</th>
                    <th class="right" style="background-color: #4a4a4a; color: white; padding: 12px 15px; text-align: right; font-size: 11px; font-weight: bold; text-transform: uppercase;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map((item, index) => `
                    <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 11px;">${item.description}</td>
                        <td class="center" style="padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 11px; text-align: center;">${item.quantity}</td>
                        <td class="right" style="padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right;">$${item.unitPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</td>
                        <td class="right" style="padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right;">$${item.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Totals Section -->
        <div class="totals-section" style="margin-top: 30px; text-align: right;">
            <table class="totals-table" style="margin-left: auto; width: 300px;">
                <tr>
                    <td style="padding: 8px 15px; font-size: 11px; text-align: right; color: #666;">Subtotal:</td>
                    <td style="padding: 8px 15px; font-size: 11px; text-align: right; font-weight: bold; width: 100px;">$${data.subtotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                </tr>
                ${data.bonusAmount && data.bonusAmount > 0 ? `
                <tr>
                    <td style="padding: 8px 15px; font-size: 11px; text-align: right; color: #666;">Bonus Amount:</td>
                    <td style="padding: 8px 15px; font-size: 11px; text-align: right; font-weight: bold; width: 100px;">$${data.bonusAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                </tr>
                ` : ''}
                <tr class="total-row" style="border-top: 2px solid #333; font-size: 12px;">
                    <td style="padding: 20px 15px 8px; font-weight: bold; color: #333; text-align: right;">Total:</td>
                    <td style="padding: 20px 15px 8px; font-weight: bold; color: #333; text-align: right; width: 100px;">$${data.total.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                </tr>
            </table>
        </div>
    </div>
  `;
}

/**
 * Generates an invoice PDF from HTML template using jsPDF + html2canvas
 * @param data - Invoice data
 * @returns PDF as Blob
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Blob> {
  try {
    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.innerHTML = generateInvoiceHTML(data);
    document.body.appendChild(container);

    // Wait for images (logo) to load
    const images = container.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        img =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null); // Continue even if image fails
              // Timeout after 3 seconds
              setTimeout(() => resolve(null), 3000);
            }
          })
      )
    );

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality (2x resolution)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate dimensions for A4 page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    // Create PDF
    const pdf = new jsPDF({
      orientation: scaledHeight > pdfHeight ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);

    // If content exceeds one page, add additional pages
    if (scaledHeight > pdfHeight) {
      let heightLeft = scaledHeight - pdfHeight;
      let position = -pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }
    }

    // Return as Blob
    return pdf.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(
      `Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


