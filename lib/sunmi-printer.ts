/**
 * Thermal Printer Service for Sunmi T2S
 * Uses expo-print for PDF generation and system print service
 * Label format: 62mm width x 50mm height
 */

import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import type { ServiceTicket } from '@/types/ticket';
import { generateTicketQRData, generateTelegramFallbackLink } from './qr-code';
import { settingsStorage } from './storage';

/**
 * Generate HTML for ticket label (62mm x 50mm)
 */
function generateTicketLabelHTML(ticket: ServiceTicket, telegramLink?: string): string {
  const formattedDate = new Date(ticket.dateReceived).toLocaleDateString('ro-RO');
  const problemText = ticket.problemDescription.length > 50
    ? ticket.problemDescription.substring(0, 47) + '...'
    : ticket.problemDescription;

  // Generate QR code data
  const qrData = generateTicketQRData(ticket);

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
          padding: 4mm;
          font-family: 'Courier New', monospace;
          font-size: 10pt;
          line-height: 1.2;
          width: 62mm;
          height: 50mm;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          font-weight: bold;
          font-size: 14pt;
          margin-bottom: 2mm;
          border-bottom: 2px solid #000;
          padding-bottom: 1mm;
        }
        .info-row {
          margin: 1mm 0;
          font-size: 9pt;
        }
        .label {
          font-weight: bold;
        }
        .separator {
          border-top: 1px dashed #000;
          margin: 2mm 0;
        }
        .qr-container {
          text-align: center;
          margin-top: 2mm;
        }
        .qr-placeholder {
          font-size: 8pt;
          text-align: center;
          margin-top: 2mm;
        }
        .telegram-link {
          font-size: 7pt;
          text-align: center;
          margin-top: 1mm;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="header">FIȘĂ SERVICE</div>
      
      <div class="info-row">
        <span class="label">ID:</span> ${ticket.id}
      </div>
      <div class="info-row">
        <span class="label">TEL:</span> ${ticket.clientPhone}
      </div>
      <div class="info-row">
        <span class="label">DATA:</span> ${formattedDate}
      </div>
      
      <div class="separator"></div>
      
      <div class="info-row">
        <span class="label">DEFECT:</span><br>
        ${problemText}
      </div>
      
      <div class="qr-placeholder">
        Scanează QR pentru detalii
      </div>
      
      ${telegramLink ? `
        <div class="telegram-link">${telegramLink}</div>
      ` : ''}
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
    // Get Telegram link
    const telegramConfig = await settingsStorage.getTelegramConfig();
    const telegramLink = telegramConfig?.groupId && ticket.telegramMessageId
      ? generateTelegramFallbackLink(ticket, telegramConfig.groupId)
      : undefined;
    
    // Generate HTML
    const html = generateTicketLabelHTML(ticket, telegramLink);
    
    // Print to PDF
    const { uri } = await Print.printToFileAsync({ html });
    
    // Share/Print PDF
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    
    return { success: true };
  } catch (error) {
    console.error('Error printing label:', error);
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
    clientEmail: 'test@example.com',
    productType: 'laptop',
    productModel: 'Test Model',
    productSerialNumber: 'SN123456',
    problemDescription: 'Test problem description',
    diagnostic: 'Test diagnostic',
    solutionApplied: 'Test solution',
    cost: 100,
    status: 'pending',
    technicianName: 'Test Technician',
    dateReceived: new Date().toISOString(),
    dateDelivered: null,
    telegramSent: false,
    telegramMessageId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return await printLabel(testTicket);
}

/**
 * Print multiple labels
 */
export async function printMultipleLabels(tickets: ServiceTicket[]): Promise<{
  success: boolean;
  printed: number;
  error?: string;
}> {
  try {
    let printedCount = 0;

    for (const ticket of tickets) {
      const result = await printLabel(ticket);
      if (result.success) {
        printedCount++;
      }
    }

    return {
      success: printedCount === tickets.length,
      printed: printedCount,
      error: printedCount < tickets.length ? 'Unele etichete nu au putut fi tipărite' : undefined,
    };
  } catch (error) {
    return {
      success: false,
      printed: 0,
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
    message: 'Printer is available via system print service',
  };
}
