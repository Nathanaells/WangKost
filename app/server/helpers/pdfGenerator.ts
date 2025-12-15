import puppeteer from "puppeteer";
import bwipjs from "bwip-js";

interface InvoiceData {
  invoiceNumber: string;
  tenantName: string;
  roomNumber: string;
  hostelName: string;
  hostelAddress: string;
  monthYear: string;
  rentPrice: number;
  additionals: Array<{ name: string; price: number }>;
  totalPrice: number;
  dueDate: string;
  paymentUrl: string;
}

async function generateBarcode(text: string): Promise<string> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128", // Barcode type
      text: text, // Text to encode
      scale: 3, // 3x scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: "center", // Always good to set this
    });

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (error) {
    console.error("Error generating barcode:", error);
    throw error;
  }
}

/**
 * Generate HTML template for invoice
 */
function generateInvoiceHTML(data: InvoiceData, barcodeBase64: string): string {
  const additionalRows = data.additionals
    .map(
      (add) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${add.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        Rp ${add.price.toLocaleString("id-ID")}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #5353ec;
          margin-bottom: 5px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          width: 150px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #5353ec;
          color: white;
          padding: 12px;
          text-align: left;
        }
        .total-row {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 18px;
        }
        .barcode-section {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          border: 2px dashed #5353ec;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .payment-button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background-color: #5353ec;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE PEMBAYARAN KOST</h1>
        <p>Invoice #${data.invoiceNumber}</p>
      </div>

      <div class="info-section">
        <div class="info-row">
          <div class="info-label">Nama Penyewa:</div>
          <div>${data.tenantName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Nama Kost:</div>
          <div>${data.hostelName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Alamat:</div>
          <div>${data.hostelAddress}</div>
        </div>
        <div class="info-row">
          <div class="info-label">No. Kamar:</div>
          <div>${data.roomNumber}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Periode:</div>
          <div>${data.monthYear}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Jatuh Tempo:</div>
          <div style="color: red; font-weight: bold;">${data.dueDate}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Keterangan</th>
            <th style="text-align: right;">Harga</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Sewa Kamar</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
              Rp ${data.rentPrice.toLocaleString("id-ID")}
            </td>
          </tr>
          ${additionalRows}
          <tr class="total-row">
            <td style="padding: 12px;">TOTAL</td>
            <td style="padding: 12px; text-align: right;">
              Rp ${data.totalPrice.toLocaleString("id-ID")}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="barcode-section">
        <p><strong>Scan barcode untuk membayar:</strong></p>
        <img src="${barcodeBase64}" alt="Invoice Barcode" />
        <br>
        <a href="${data.paymentUrl}" class="payment-button">BAYAR SEKARANG</a>
      </div>

      <div class="footer">
        <p>Terima kasih telah menjadi penghuni kost kami.</p>
        <p>Untuk pertanyaan, hubungi admin kost.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate PDF invoice
 * @param data - Invoice data
 * @param outputPath - Path to save PDF (optional, returns buffer if not provided)
 * @returns PDF buffer or file path
 */
export async function generateInvoicePDF(
  data: InvoiceData,
  outputPath?: string
): Promise<Buffer> {
  let browser;

  try {
    // Generate barcode
    const barcodeBase64 = await generateBarcode(data.invoiceNumber);

    // Generate HTML
    const html = generateInvoiceHTML(data, barcodeBase64);

    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    // Save to file if path provided
    if (outputPath) {
      const fs = require("fs").promises;
      await fs.writeFile(outputPath, pdfBuffer);
    }

    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("Error generating PDF:", error);
    throw error;
  }
}
