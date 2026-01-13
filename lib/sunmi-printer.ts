/**
 * Thermal Printer Service for Sunmi T2S
 * Uses Android Print Service (expo-print) instead of proprietary Sunmi API
 * Label format: 62mm width x 50mm height
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ServiceTicket } from '@/types/ticket';

/**
 * Generate HTML for ticket label (62mm x 50mm)
 * Optimized for thermal printer
 */
function generateTicketLabelHTML(ticket: ServiceTicket, qrCodeDataUrl?: string): string {
  const formattedDate = new Date(ticket.dateReceived).toLocaleDateString('ro-RO');
  
  // Truncate problem description to fit on label
  const problemText = ticket.problemDescription.length > 40
    ? ticket.problemDescription.substring(0, 37) + '...'
    : ticket.problemDescription;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      line-height: 1.3;
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
      display: flex;
      justify-content: space-between;
    }
    
    .label {
      font-weight: bold;
    }
    
    .separator {
      border-top: 1px solid #000;
      margin: 2mm 0;
    }
    
    .defect-section {
      margin-top: 2mm;
    }
    
    .defect-label {
      font-weight: bold;
      margin-bottom: 1mm;
    }
    
    .defect-text {
      font-size: 9pt;
    }
    
    .qr-section {
      text-align: center;
      margin-top: 2mm;
    }
    
    .qr-code {
      width: 20mm;
      height: 20mm;
      margin: 0 auto;
    }
    
    .telegram-link {
      font-size: 7pt;
      margin-top: 1mm;
    }
  </style>
</head>
<body>
  <div class="header">FIȘĂ SERVICE</div>
  
  <div class="info-row">
    <span><span class="label">ID:</span> ${ticket.id}</span>
  </div>
  
  <div class="info-row">
    <span><span class="label">TEL:</span> ${ticket.clientPhone}</span>
  </div>
  
  <div class="info-row">
    <span><span class="label">DATA:</span> ${formattedDate}</span>
  </div>
  
  <div class="separator"></div>
  
  <div class="defect-section">
    <div class="defect-label">DEFECT:</div>
    <div class="defect-text">${problemText}</div>
  </div>
  
  ${qrCodeDataUrl ? `
  <div class="separator"></div>
  <div class="qr-section">
    <img src="${qrCodeDataUrl}" class="qr-code" alt="QR Code" />
    <div class="telegram-link">Scanează pentru detalii</div>
  </div>
  ` : ''}
</body>
</html>
  `;
}

/**
 * Print ticket label using Android Print Service
 */
export async function printLabel(ticket: ServiceTicket, qrCodeDataUrl?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const html = generateTicketLabelHTML(ticket, qrCodeDataUrl);
    
    await Print.printAsync({
      html,
      width: 62 * 3.78, // 62mm to pixels (1mm ≈ 3.78px at 96 DPI)
      height: 50 * 3.78, // 50mm to pixels
    });

    return { success: true };
  } catch (error) {
    console.error('Error printing ticket label:', error);
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
  try {
    const testTicket: ServiceTicket = {
      id: 'TEST123',
      clientName: 'Test Client',
      clientPhone: '0712345678',
      clientEmail: 'test@example.com',
      productType: 'laptop',
      productModel: 'Test Model',
      productSerialNumber: 'SN123456',
      problemDescription: 'Test problem description',
      diagnostic: '',
      solutionApplied: '',
      cost: 100,
      status: 'pending',
      technicianName: 'Test Technician',
      dateReceived: new Date().toISOString(),
      dateDelivered: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      telegramSent: false,
      telegramMessageId: null,
    };

    return await printLabel(testTicket);
  } catch (error) {
    console.error('Error printing test label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la imprimare test',
    };
  }
}

/**
 * Print multiple labels
 */
export async function printMultipleLabels(
  tickets: ServiceTicket[],
  qrCodeDataUrls?: string[]
): Promise<{
  success: boolean;
  printed: number;
  error?: string;
}> {
  try {
    let printedCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const qrCode = qrCodeDataUrls?.[i];

      try {
        const result = await printLabel(ticket, qrCode);
        if (result.success) {
          printedCount++;
        }
      } catch (e) {
        console.error('Error printing label:', e);
      }
    }

    return {
      success: printedCount === tickets.length,
      printed: printedCount,
      error: printedCount < tickets.length ? 'Unele etichete nu au putut fi tipărite' : undefined,
    };
  } catch (error) {
    console.error('Error printing multiple labels:', error);
    return {
      success: false,
      printed: 0,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
    };
  }
}

/**
 * Get printer status (not available with expo-print)
 */
export async function getPrinterStatus(): Promise<{
  available: boolean;
  message: string;
}> {
  try {
    // expo-print doesn't have isAvailableAsync, assume available
    const isAvailable = true;
    return {
      available: isAvailable,
      message: isAvailable
        ? 'Serviciu de imprimare disponibil'
        : 'Serviciu de imprimare indisponibil',
    };
  } catch (error) {
    return {
      available: false,
      message: 'Eroare la verificare status imprimantă',
    };
  }
}
