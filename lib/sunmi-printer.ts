/**
 * Thermal Printer Service for Sunmi T2S
 * Uses react-native-sunmi-inner-printer for SunmiPrinterService
 * Label format: 62mm width x 50mm height
 */

import SunmiInnerPrinter from 'react-native-sunmi-inner-printer';
import type { ServiceTicket } from '@/types/ticket';
import { generateTicketQRData, generateTelegramFallbackLink } from './qr-code';
import { settingsStorage } from './storage';

/**
 * Initialize Sunmi printer
 */
async function initPrinter(): Promise<void> {
  try {
    await SunmiInnerPrinter.printerInit();
  } catch (error) {
    console.error('Error initializing printer:', error);
    throw error;
  }
}

/**
 * Generate ticket label text for Sunmi printer
 * Format optimized for 62mm x 50mm label
 */
function generateTicketLabelText(ticket: ServiceTicket): string {
  const formattedDate = new Date(ticket.dateReceived).toLocaleDateString('ro-RO');
  
  // Truncate problem description to fit on label
  const problemText = ticket.problemDescription.length > 40
    ? ticket.problemDescription.substring(0, 37) + '...'
    : ticket.problemDescription;

  let labelText = '';
  
  // Header - centered, bold, double height
  labelText += '\n';
  labelText += '     FIȘĂ SERVICE\n';
  labelText += '═══════════════════════════\n';
  labelText += '\n';
  
  // Info section
  labelText += `ID: ${ticket.id}\n`;
  labelText += `TEL: ${ticket.clientPhone}\n`;
  labelText += `DATA: ${formattedDate}\n`;
  labelText += '───────────────────────────\n';
  
  // Defect section
  labelText += 'DEFECT:\n';
  labelText += `${problemText}\n`;
  labelText += '───────────────────────────\n';
  
  // Footer
  labelText += '\n';
  labelText += 'Scanează QR pentru detalii\n';
  labelText += '\n';

  return labelText;
}

/**
 * Print ticket label using Sunmi printer
 */
export async function printLabel(ticket: ServiceTicket, qrCodeDataUrl?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Initialize printer
    await initPrinter();

    // Set alignment to center
    await SunmiInnerPrinter.setAlignment(1); // 0=left, 1=center, 2=right

    // Print header with larger font
    await SunmiInnerPrinter.setFontSize(28);
    await SunmiInnerPrinter.printText('FIȘĂ SERVICE\n');
    await SunmiInnerPrinter.printText('═══════════════════════════\n');

    // Reset to normal font
    await SunmiInnerPrinter.setFontSize(24);
    await SunmiInnerPrinter.printText('\n');

    // Set alignment to left for info
    await SunmiInnerPrinter.setAlignment(0);

    // Print ticket info
    const formattedDate = new Date(ticket.dateReceived).toLocaleDateString('ro-RO');
    await SunmiInnerPrinter.printText(`ID: ${ticket.id}\n`);
    await SunmiInnerPrinter.printText(`TEL: ${ticket.clientPhone}\n`);
    await SunmiInnerPrinter.printText(`DATA: ${formattedDate}\n`);
    await SunmiInnerPrinter.printText('───────────────────────────\n');

    // Print defect
    const problemText = ticket.problemDescription.length > 40
      ? ticket.problemDescription.substring(0, 37) + '...'
      : ticket.problemDescription;
    
    await SunmiInnerPrinter.printText('DEFECT:\n');
    await SunmiInnerPrinter.printText(`${problemText}\n`);
    await SunmiInnerPrinter.printText('───────────────────────────\n');

    // Print QR code
    await SunmiInnerPrinter.setAlignment(1); // Center
    await SunmiInnerPrinter.printText('\n');
    
    // Generate QR code data (deep link with Telegram fallback)
    const qrData = generateTicketQRData(ticket);
    
    try {
      // Print QR code using Sunmi API
      // Parameters: data, moduleSize (8), errorLevel (3 = high)
      await SunmiInnerPrinter.printQRCode(qrData, 8, 3);
    } catch (error) {
      console.error('Error printing QR code:', error);
      // Fallback to text if QR code fails
      await SunmiInnerPrinter.printText('Scanează QR pentru detalii\n');
    }
    
    // Print Telegram fallback link
    const settings = await settingsStorage.getSettings();
    const telegramConfig = await settingsStorage.getTelegramConfig();
    if (telegramConfig?.groupId && ticket.telegramMessageId) {
      const telegramLink = generateTelegramFallbackLink(ticket, telegramConfig.groupId);
      await SunmiInnerPrinter.setFontSize(18);
      await SunmiInnerPrinter.printText(`${telegramLink}\n`);
    }

    // Feed paper
    await SunmiInnerPrinter.printText('\n\n');
    await SunmiInnerPrinter.lineWrap(3);

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
 * Get printer status
 */
export async function getPrinterStatus(): Promise<{
  available: boolean;
  message: string;
}> {
  try {
    await initPrinter();
    return {
      available: true,
      message: 'Sunmi PrinterService disponibil',
    };
  } catch (error) {
    return {
      available: false,
      message: 'Sunmi PrinterService indisponibil',
    };
  }
}
