# Frontend PDF Generation Migration

## Overview

Migrated invoice PDF generation from backend (Puppeteer/Sparticuz) to frontend (pdf-lib) for improved reliability, reduced serverless function complexity, and better user experience.

## Changes Made

### ✅ Added Dependencies

- **`pdf-lib@1.17.1`** - Frontend PDF generation library

### ❌ Removed Dependencies

- **`puppeteer`** - No longer needed (backend PDF generation)
- **`@sparticuz/chromium`** - No longer needed (Vercel-specific Chromium binary)

### 📁 New Files Created

1. **`lib/helpers/generateInvoicePdf.ts`**
   - Pure frontend PDF generation logic
   - Uses pdf-lib to create professional invoices
   - Includes company branding, line items, totals
   - Supports text wrapping and multi-page invoices
   - Returns PDF as Blob for download or backend submission

### 🗑️ Files Deleted

1. **`lib/services/PDFService.ts`** - Replaced by frontend generation
2. **`vercel.json`** - No longer need extended timeouts
3. **`app/api/invoice/download/[id]/route.ts`** - Download handled on frontend

### 🔄 Files Modified

#### 1. `app/admin/invoices/page.tsx`

**PDF Download** (Lines 286-317):
```typescript
// OLD: Fetch PDF from backend
const response = await fetch(`/api/invoice/download/${payment.id}`);
const blob = await response.blob();

// NEW: Generate PDF on frontend
const pdfBlob = await generateInvoicePdf({
  invoiceNumber: payment.invoiceNumber,
  clientName: payment.clientName,
  // ... other invoice data
});
```

**Email Invoice** (Lines 346-395):
```typescript
// OLD: Send JSON, backend generates PDF
const response = await fetch('/api/invoice/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ invoiceId, message })
});

// NEW: Generate PDF on frontend, send via FormData
const pdfBlob = await generateInvoicePdf({ /* invoice data */ });
const formData = new FormData();
formData.append('pdf', pdfBlob, `invoice-${invoiceNumber}.pdf`);
formData.append('invoiceId', invoice.id);
formData.append('message', emailMessage);

const response = await fetch('/api/invoice/send-email', {
  method: 'POST',
  body: formData  // No Content-Type header (browser sets boundary)
});
```

#### 2. `app/api/invoice/send-email/route.ts`

**Before:**
```typescript
// Generated PDF on backend
const pdfService = PDFService.getInstance();
const pdfResult = await pdfService.generateInvoicePDF(invoice, invoiceNumber);
```

**After:**
```typescript
// Receive PDF from frontend via FormData
const formData = await request.formData();
const pdfFile = formData.get('pdf') as File;
const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

// Attach to email
pdfAttachment: {
  filename: `invoice-${invoice.invoiceNumber}.pdf`,
  content: pdfBuffer,
  contentType: 'application/pdf'
}
```

## Architecture

### Frontend PDF Generation Flow

```
┌─────────────────────────────────────────┐
│         User Action (Download/Email)   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     generateInvoicePdf(invoiceData)     │
│     - Creates PDF using pdf-lib         │
│     - Adds company branding             │
│     - Renders invoice items & totals    │
│     - Returns Blob                      │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────────┐
│   Download    │    │   Email via Backend  │
│   - Save to   │    │   - Create FormData  │
│     disk      │    │   - Append PDF Blob  │
└───────────────┘    │   - POST to API      │
                     │   - Backend attaches │
                     │     to email         │
                     └──────────────────────┘
```

### Benefits

1. **🚀 Performance**
   - No serverless function cold starts for PDF generation
   - Immediate PDF preview/download
   - Reduced backend processing time

2. **💰 Cost Reduction**
   - No Vercel function timeout extensions needed
   - Reduced serverless execution time
   - Smaller deployment bundle (no Chromium)

3. **🔒 Reliability**
   - No Puppeteer/Chromium compatibility issues
   - Works consistently across all environments
   - No binary dependency conflicts

4. **🎨 Better UX**
   - Instant PDF generation
   - No backend processing delays
   - Same PDF for download and email

5. **🛠️ Maintainability**
   - Simpler codebase (one PDF generation method)
   - No complex Puppeteer/Chromium setup
   - Easier to customize PDF layout

## PDF Features

### Current Implementation

- ✅ Company branding (name, contact info)
- ✅ Invoice metadata (number, dates, client info)
- ✅ Itemized line items with quantities and prices
- ✅ Subtotal, tax, and total calculations
- ✅ Custom notes section
- ✅ Professional styling (colors, fonts, layout)
- ✅ Multi-page support for long invoices
- ✅ Text wrapping for descriptions

### Future Enhancements

- [ ] Company logo embedding (requires image URL or base64)
- [ ] Custom font embedding (e.g., brand fonts)
- [ ] QR code for payment links
- [ ] Digital signatures
- [ ] Watermarks (draft, paid, etc.)
- [ ] Multiple currency support
- [ ] Multi-language templates

## Usage Examples

### Download Invoice

```typescript
const handleDownload = async (invoice: Invoice) => {
  const pdfBlob = await generateInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    items: invoice.items,
    subtotal: invoice.subtotal,
    total: invoice.total,
    companyName: 'Nobilis Talent Solutions',
    companyEmail: 'info@nobilistalentsolutions.com',
  });

  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoice.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Email Invoice

```typescript
const handleEmail = async (invoice: Invoice, message: string) => {
  const pdfBlob = await generateInvoicePdf({
    // ... invoice data
    notes: message,  // Include custom message in PDF
  });

  const formData = new FormData();
  formData.append('pdf', pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);
  formData.append('invoiceId', invoice.id);
  formData.append('message', message);

  await fetch('/api/invoice/send-email', {
    method: 'POST',
    body: formData,
  });
};
```

## Testing Checklist

- [x] Invoice download generates correct PDF
- [x] Invoice email sends with PDF attachment
- [x] PDF displays correctly in email clients
- [x] PDF contains all invoice data
- [x] Company branding displays correctly
- [x] Multi-page invoices render properly
- [x] Text wrapping works for long descriptions
- [x] Removed dependencies don't break build
- [x] No ESLint errors

## Deployment Notes

1. **Environment Variables**: No new variables required
2. **Build**: Run `pnpm build` to verify
3. **Bundle Size**: Reduced by ~15MB (Chromium removal)
4. **Vercel Config**: Removed custom timeouts (vercel.json deleted)

## Rollback Plan

If issues arise, the previous implementation can be restored by:

1. Reinstalling dependencies: `pnpm add puppeteer @sparticuz/chromium`
2. Restoring `lib/services/PDFService.ts` from git history
3. Reverting API route changes
4. Restoring `vercel.json` for function timeouts

## References

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [MDN: Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

