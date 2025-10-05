const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🧪 Starting Puppeteer test...');
  
  let browser;
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images'
      ],
      timeout: 60000,
      protocolTimeout: 60000
    });
    
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✅ New page created');
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Test PDF</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .content { font-size: 14px; line-height: 1.5; }
        </style>
    </head>
    <body>
        <div class="header">Test PDF Generation</div>
        <div class="content">
            <p>This is a test PDF to verify that Puppeteer is working correctly.</p>
            <p>If you can see this PDF, then the PDF generation is working!</p>
        </div>
    </body>
    </html>`;
    
    console.log('📄 Setting page content...');
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ Page content set, generating PDF...');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('test-output.pdf', pdfBuffer);
    console.log('✅ PDF saved to test-output.pdf');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

testPuppeteer().then(() => {
  console.log('🎉 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
