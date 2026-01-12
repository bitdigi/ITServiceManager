/**
 * Sunmi Native Printer Service
 * For Sunmi T2S AIO with integrated printer
 * Uses Sunmi PrinterService API directly (no Bluetooth required)
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
    return date.toLocaleDateString('ro-RO');
  } catch {
    return dateString;
  }
}

/**
 * Generate label text for Sunmi printer (ESC/POS format)
 * Format optimized for 62mm x 50mm label
 */
function generateLabelText(ticket: ServiceTicket): string {
  const ticketId = ticket.id.substring(0, 8).toUpperCase();
  const clientPhone = ticket.clientPhone;
  const receivedDate = formatDate(ticket.dateReceived);
  const problem = ticket.problemDescription.substring(0, 30);

  // ESC/POS commands for thermal printer
  const ESC = '\x1B';
  const ALIGN_CENTER = ESC + 'a' + '\x01';
  const ALIGN_LEFT = ESC + 'a' + '\x00';
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const FEED_LINE = '\n';
  const SEPARATOR = '═══════════════\n';

  let label = `${ALIGN_CENTER}${BOLD_ON}FIȘĂ SERVICE${BOLD_OFF}${FEED_LINE}`;
  label += `${ALIGN_LEFT}ID: ${ticketId}${FEED_LINE}`;
  label += `${FEED_LINE}`;
  label += `TEL: ${clientPhone}${FEED_LINE}`;
  label += `${FEED_LINE}`;
  label += `DATA: ${receivedDate}${FEED_LINE}`;
  label += `${FEED_LINE}`;
  label += `DEFECT:${FEED_LINE}`;
  label += `${problem}...${FEED_LINE}`;
  label += `${FEED_LINE}`;

  // Add QR code reference
  const qrData = generateQRCodeForPrinter(ticket);
  label += `${ALIGN_CENTER}[QR CODE]${FEED_LINE}`;
  label += `${qrData.value}${FEED_LINE}`;
  if (qrData.fallbackUrl) {
    label += `${FEED_LINE}Telegram:${FEED_LINE}${qrData.fallbackUrl}${FEED_LINE}`;
  }

  label += `${ALIGN_CENTER}${SEPARATOR}${FEED_LINE}${FEED_LINE}`;

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
    const ALIGN_CENTER = ESC + 'a' + '\x01';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const FEED_LINE = '\n';

    const testLabel = `${ALIGN_CENTER}${BOLD_ON}TEST IMPRIMARE${BOLD_OFF}${FEED_LINE}`;
    testLabel.concat(`${FEED_LINE}`);
    testLabel.concat(`Sunmi T2S - Imprimanta Integrata${FEED_LINE}`);
    testLabel.concat(`Etichetă 62mm x 50mm${FEED_LINE}`);
    testLabel.concat(`${FEED_LINE}`);
    testLabel.concat(`═══════════════${FEED_LINE}`);
    testLabel.concat(`${FEED_LINE}${FEED_LINE}`);

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
