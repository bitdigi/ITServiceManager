/**
 * Thermal Printer Service for Sunmi T2S
 * Uses expo-print for PDF generation and system print service
 * Label format: 62mm width x 50mm height
 */

import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import type { ServiceTicket } from '@/types/ticket';
import { generateTicketQRCode } from './qr-code-generator';

/**
 * Generate HTML for ticket label (62mm x 50mm)
 */
async function generateTicketLabelHTML(ticket: ServiceTicket, qrCodeImage: string): Promise<string> {
  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('ro-RO');
  const problemText = ticket.defectDescription.length > 50
    ? ticket.defectDescription.substring(0, 47) + '...'
    : ticket.defectDescription;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        @page {
          size: 62mm 50mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 2mm;
          font-family: -apple-system, system-ui, sans-serif;
          font-size: 9pt;
          width: 62mm;
          height: 50mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .header {
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 1mm;
          border-bottom: 1px solid #000;
          padding-bottom: 0.5mm;
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          margin: 0.5mm 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 0.3mm 0;
          font-size: 8pt;
        }
        .label {
          font-weight: bold;
          min-width: 12mm;
        }
        .value {
          flex: 1;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 28mm;
        }
        .defect {
          margin-top: 0.5mm;
          padding-top: 0.5mm;
          border-top: 1px solid #000;
          font-size: 7pt;
          max-height: 5mm;
          overflow: hidden;
        }
        .qr-section {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 0.5mm;
          padding-top: 0.5mm;
          border-top: 1px solid #000;
        }
        .qr-code {
          width: 18mm;
          height: 18mm;
        }
      </style>
    </head>
    <body>
      <div class="header">FIȘĂ SERVICE</div>
      
      <div class="content">
        <div class="row">
          <span class="label">ID:</span>
          <span class="value">${ticket.id.substring(0, 8)}</span>
        </div>
        
        <div class="row">
          <span class="label">TEL:</span>
          <span class="value">${ticket.clientPhone}</span>
        </div>
        
        <div class="row">
          <span class="label">DATA:</span>
          <span class="value">${formattedDate}</span>
        </div>
        
        <div class="defect">
          <strong>Defect:</strong> ${problemText}
        </div>
      </div>
      
      <div class="qr-section">
        <img src="${qrCodeImage}" class="qr-code" alt="QR Code">
      </div>
    </body>
    </html>
  `;
}

/**
 * Print ticket label on Sunmi T2S thermal printer
 */
export async function printLabel(ticket: ServiceTicket): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Generate QR code image
    const qrCodeImage = await generateTicketQRCode(ticket.id, ticket.telegramGroupId, ticket.telegramMessageId);
    
    // Generate HTML
    const html = await generateTicketLabelHTML(ticket, qrCodeImage);
    
    // Print to PDF
    const { uri } = await Print.printToFileAsync({
      html,
      width: 62 * 2.83465,
      height: 50 * 2.83465,
    });
    
    // Share/Print PDF
    await shareAsync(uri);
    
    return { success: true };
  } catch (error) {
    console.error('[SunmiPrinter] Error printing label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
    };
  }
}

/**
 * Print test label
 */
export async function printTestLabel(): Promise<{
  success: boolean;
  error?: string;
}> {
  const testTicket: ServiceTicket = {
    id: 'TEST-001',
    clientName: 'Test Client',
    clientPhone: '0700000000',
    productType: 'laptop',
    defectDescription: 'Test problem description',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    technicianName: 'Test Technician',
    estimatedCost: 100,
    actualCost: 0,
    notes: '',
    telegramGroupId: '',
    telegramMessageId: 0,
  };
  
  return await printLabel(testTicket);
}

/**
 * Print multiple identical labels
 */
export async function printMultipleLabels(
  ticket: ServiceTicket,
  count: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate QR code image
    const qrCodeImage = await generateTicketQRCode(ticket.id, ticket.telegramGroupId, ticket.telegramMessageId);
    
    // Generate HTML for single label
    const html = await generateTicketLabelHTML(ticket, qrCodeImage);
    
    // Generate multiple labels in one PDF
    const multipleLabelsHTML = Array(count)
      .fill(html)
      .join('<div style="page-break-after: always;"></div>');
    
    const { uri } = await Print.printToFileAsync({
      html: multipleLabelsHTML,
      width: 62 * 2.83465,
      height: 50 * 2.83465,
    });
    
    await shareAsync(uri);
    
    return { success: true };
  } catch (error) {
    console.error('[SunmiPrinter] Error printing multiple labels:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
    };
  }
}

/**
 * Get printer status
 */
export async function getPrinterStatus(): Promise<{ available: boolean; message: string }> {
  return {
    available: true,
    message: 'Imprimanta disponibilă prin serviciul de imprimare sistem',
  };
}
