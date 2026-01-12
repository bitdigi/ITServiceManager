/**
 * Sunmi Native Printer Service
 * For Sunmi T2S AIO with integrated printer
 * Uses Sunmi PrinterService API directly (no Bluetooth required)
 * Optimized label design for 62mm x 50mm thermal labels
 */

import { NativeModules, Alert } from 'react-native';
import { ServiceTicket } from '@/types/ticket';
import { generateQRCodeForPrinter } from './qr-code';

// Access Sunmi PrinterService through NativeModules
const SunmiPrinter = NativeModules.SunmiPrinter || NativeModules.SunmiPrinterModule;

/**
 * Format product type for display
 */
function formatProductType(type: string): string {
  const productNames: Record<string, string> = {
    laptop: 'Laptop',
    pc: 'PC',
    phone: 'Telefon',
    printer: 'Imprimantă',
    gps: 'GPS',
    tv: 'TV',
    box: 'Box',
    tablet: 'Tabletă',
  };
  return productNames[type] || type;
}

/**
 * Format date to DD.MM.YYYY
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Generate optimized label text for Sunmi printer (ESC/POS format)
 * Format optimized for 62mm x 50mm label with clear visual hierarchy
 * 
 * Label Layout:
 * ┌──────────────────────────┐
 * │   FIȘĂ SERVICE           │
 * │ ════════════════════════ │
 * │ ID: ABC123               │
 * │ TEL: 0712345678          │
 * │ DATA: 12.01.2025         │
 * │ ──────────────────────── │
 * │ DEFECT:                  │
 * │ Nu pornește...           │
 * │ ──────────────────────── │
 * │     [QR CODE]            │
 * │ t.me/search?q=ABC123     │
 * └──────────────────────────┘
 */
function generateLabelText(ticket: ServiceTicket): string {
  const ticketId = ticket.id.substring(0, 8).toUpperCase();
  const clientPhone = ticket.clientPhone;
  const receivedDate = formatDate(ticket.dateReceived);
  const problem = ticket.problemDescription.length > 40 
    ? ticket.problemDescription.substring(0, 37) + '...' 
    : ticket.problemDescription;

  // ESC/POS commands for thermal printer
  const ESC = '\x1B';
  const GS = '\x1D';
  
  // Alignment
  const ALIGN_CENTER = ESC + 'a' + '\x01';
  const ALIGN_LEFT = ESC + 'a' + '\x00';
  
  // Text formatting
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const DOUBLE_HEIGHT = GS + '!' + '\x01'; // Double height
  const NORMAL_SIZE = GS + '!' + '\x00';   // Normal size
  
  // Separators
  const FEED_LINE = '\n';
  const THICK_SEP = '════════════════════════\n';
  const THIN_SEP = '────────────────────────\n';

  // Build label with optimized layout
  let label = '';
  
  // Header - centered, bold, double height
  label += ALIGN_CENTER;
  label += BOLD_ON;
  label += DOUBLE_HEIGHT;
  label += 'FIȘĂ SERVICE';
  label += NORMAL_SIZE;
  label += BOLD_OFF;
  label += FEED_LINE;
  
  // Thick separator
  label += THICK_SEP;
  label += FEED_LINE;
  
  // Ticket info - left aligned, normal size
  label += ALIGN_LEFT;
  label += BOLD_ON;
  label += 'ID: ';
  label += BOLD_OFF;
  label += ticketId;
  label += FEED_LINE;
  label += FEED_LINE;
  
  label += BOLD_ON;
  label += 'TEL: ';
  label += BOLD_OFF;
  label += clientPhone;
  label += FEED_LINE;
  label += FEED_LINE;
  
  label += BOLD_ON;
  label += 'DATA: ';
  label += BOLD_OFF;
  label += receivedDate;
  label += FEED_LINE;
  label += FEED_LINE;
  
  // Thin separator
  label += THIN_SEP;
  label += FEED_LINE;
  
  // Defect description
  label += BOLD_ON;
  label += 'DEFECT:';
  label += BOLD_OFF;
  label += FEED_LINE;
  label += problem;
  label += FEED_LINE;
  label += FEED_LINE;
  
  // Thin separator
  label += THIN_SEP;
  label += FEED_LINE;
  
  // QR code reference - centered
  label += ALIGN_CENTER;
  const qrData = generateQRCodeForPrinter(ticket);
  label += '[QR CODE]';
  label += FEED_LINE;
  label += FEED_LINE;
  
  // Telegram fallback link - small text, centered
  if (qrData.fallbackUrl) {
    // Extract just the search part for cleaner display
    const shortLink = qrData.fallbackUrl.replace('https://', '');
    label += shortLink;
    label += FEED_LINE;
  }
  
  // Final spacing
  label += FEED_LINE;
  label += FEED_LINE;

  return label;
}

/**
 * Check if Sunmi printer is available
 */
export async function isSunmiPrinterAvailable(): Promise<boolean> {
  try {
    if (!SunmiPrinter) {
      console.warn('SunmiPrinter module not available');
      return false;
    }

    // Try to call a simple method to check if printer is available
    if (SunmiPrinter.getPrinterStatus) {
      const status = await SunmiPrinter.getPrinterStatus();
      return status === 0; // 0 = normal
    }

    return true; // Assume available if module exists
  } catch (error) {
    console.error('Error checking Sunmi printer:', error);
    return false;
  }
}

/**
 * Print label on Sunmi T2S integrated printer
 */
export async function printLabel(ticket: ServiceTicket): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!SunmiPrinter) {
      return {
        success: false,
        error: 'Sunmi PrinterService nu este disponibil pe acest dispozitiv',
      };
    }

    // Generate label text
    const labelText = generateLabelText(ticket);

    // Initialize printer
    if (SunmiPrinter.initPrinter) {
      await SunmiPrinter.initPrinter();
    }

    // Print text
    if (SunmiPrinter.printText) {
      await SunmiPrinter.printText(labelText);
    } else if (SunmiPrinter.print) {
      // Alternative method name
      await SunmiPrinter.print(labelText);
    }

    // Feed paper
    if (SunmiPrinter.feedPaper) {
      await SunmiPrinter.feedPaper();
    } else if (SunmiPrinter.lineWrap) {
      await SunmiPrinter.lineWrap(3);
    }

    return {
      success: true,
    };
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
  try {
    if (!SunmiPrinter) {
      return {
        success: false,
        error: 'Sunmi PrinterService nu este disponibil',
      };
    }

    // Initialize printer
    if (SunmiPrinter.initPrinter) {
      await SunmiPrinter.initPrinter();
    }

    const ESC = '\x1B';
    const GS = '\x1D';
    const ALIGN_CENTER = ESC + 'a' + '\x01';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const DOUBLE_HEIGHT = GS + '!' + '\x01';
    const NORMAL_SIZE = GS + '!' + '\x00';
    const FEED_LINE = '\n';
    const SEPARATOR = '════════════════════════\n';

    let testLabel = ALIGN_CENTER;
    testLabel += BOLD_ON;
    testLabel += DOUBLE_HEIGHT;
    testLabel += 'TEST IMPRIMARE';
    testLabel += NORMAL_SIZE;
    testLabel += BOLD_OFF;
    testLabel += FEED_LINE;
    testLabel += SEPARATOR;
    testLabel += FEED_LINE;
    testLabel += 'Sunmi T2S';
    testLabel += FEED_LINE;
    testLabel += 'Imprimantă Integrată';
    testLabel += FEED_LINE;
    testLabel += 'Etichetă 62mm x 50mm';
    testLabel += FEED_LINE;
    testLabel += FEED_LINE;
    testLabel += SEPARATOR;
    testLabel += FEED_LINE;
    testLabel += FEED_LINE;

    // Print test label
    if (SunmiPrinter.printText) {
      await SunmiPrinter.printText(testLabel);
    } else if (SunmiPrinter.print) {
      await SunmiPrinter.print(testLabel);
    }

    // Feed paper
    if (SunmiPrinter.feedPaper) {
      await SunmiPrinter.feedPaper();
    }

    return {
      success: true,
    };
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
export async function printMultipleLabels(tickets: ServiceTicket[]): Promise<{
  success: boolean;
  printed: number;
  error?: string;
}> {
  try {
    if (!SunmiPrinter) {
      return {
        success: false,
        printed: 0,
        error: 'Sunmi PrinterService nu este disponibil',
      };
    }

    // Initialize printer
    if (SunmiPrinter.initPrinter) {
      await SunmiPrinter.initPrinter();
    }

    let printedCount = 0;

    for (const ticket of tickets) {
      try {
        const labelText = generateLabelText(ticket);

        // Print text
        if (SunmiPrinter.printText) {
          await SunmiPrinter.printText(labelText);
        } else if (SunmiPrinter.print) {
          await SunmiPrinter.print(labelText);
        }

        printedCount++;
      } catch (e) {
        console.error('Error printing ticket:', e);
      }
    }

    // Feed paper after all prints
    if (SunmiPrinter.feedPaper) {
      await SunmiPrinter.feedPaper();
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
  status: string;
  error?: string;
}> {
  try {
    if (!SunmiPrinter) {
      return {
        status: 'unavailable',
        error: 'Sunmi PrinterService nu este disponibil',
      };
    }

    if (SunmiPrinter.getPrinterStatus) {
      const statusCode = await SunmiPrinter.getPrinterStatus();
      const statusMap: Record<number, string> = {
        0: 'normal',
        1: 'offline',
        2: 'error',
        3: 'paper_low',
        4: 'paper_out',
      };
      return {
        status: statusMap[statusCode] || 'unknown',
      };
    }

    return {
      status: 'available',
    };
  } catch (error) {
    console.error('Error getting printer status:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Eroare la verificare status',
    };
  }
}
