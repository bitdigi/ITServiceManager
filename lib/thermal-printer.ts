/**
 * Thermal Printer Service
 * Handles printing labels on Sunmi T2S thermal printer
 * Label format: 62mm width x 50mm height
 */

import { ServiceTicket, ProductType } from '@/types/ticket';
import RNThermalPrinter from 'react-native-thermal-printer';

/**
 * Format product type for display
 */
function formatProductType(type: ProductType): string {
  const productNames: Record<ProductType, string> = {
    laptop: 'Laptop',
    pc: 'PC',
    phone: 'Telefon',
    printer: 'Imprimantă',
    gps: 'GPS',
    tv: 'TV',
    box: 'Box',
    tablet: 'Tabletă',
  };
  return productNames[type];
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
 * Generate label text for thermal printer (ESC/POS format)
 * Format optimized for 62mm x 50mm label
 */
function generateLabelText(ticket: ServiceTicket): string {
  const ticketId = ticket.id.substring(0, 8).toUpperCase();
  const clientPhone = ticket.clientPhone;
  const receivedDate = formatDate(ticket.dateReceived);
  const problem = ticket.problemDescription.substring(0, 30);

  // ESC/POS commands for thermal printer
  // 0x1B = ESC, 0x40 = @, 0x61 = a (align), 0x45 = E (bold)
  const ESC = '\x1B';
  const ALIGN_CENTER = ESC + 'a' + '\x01';
  const ALIGN_LEFT = ESC + 'a' + '\x00';
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const FEED_LINE = '\n';
  const SEPARATOR = '═══════════════\n';

  const label = `${ALIGN_CENTER}${BOLD_ON}FIȘĂ SERVICE${BOLD_OFF}${FEED_LINE}
${ALIGN_LEFT}ID: ${ticketId}${FEED_LINE}
${FEED_LINE}
TEL: ${clientPhone}${FEED_LINE}
${FEED_LINE}
DATA: ${receivedDate}${FEED_LINE}
${FEED_LINE}
DEFECT:${FEED_LINE}
${problem}...${FEED_LINE}
${FEED_LINE}
${ALIGN_CENTER}${SEPARATOR}${FEED_LINE}${FEED_LINE}`;

  return label;
}

/**
 * Print label on thermal printer via Bluetooth
 */
export async function printLabel(ticket: ServiceTicket): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get Bluetooth devices
    const devices = await RNThermalPrinter.getBluetoothDeviceList();

    if (!devices || devices.length === 0) {
      return {
        success: false,
        error: 'Nu s-a găsit imprimanta Bluetooth',
      };
    }

    // Use first device (Sunmi T2S)
    const device = devices[0];

    // Generate label text
    const labelText = generateLabelText(ticket);

    // Print via Bluetooth
    await RNThermalPrinter.printBluetooth({
      payload: labelText,
      printerNbrCharactersPerLine: 32, // 62mm printer typically supports 32 characters
      ...device,
    });

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
 * Get available Bluetooth printers
 */
export async function getAvailablePrinters(): Promise<{
  devices: any[];
  error?: string;
}> {
  try {
    const devices = await RNThermalPrinter.getBluetoothDeviceList();

    if (!devices || devices.length === 0) {
      return {
        devices: [],
        error: 'Nu s-au găsit imprimante Bluetooth',
      };
    }

    return {
      devices: devices,
    };
  } catch (error) {
    console.error('Error getting printers:', error);
    return {
      devices: [],
      error: error instanceof Error ? error.message : 'Eroare la căutarea imprimantelor',
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
    const devices = await RNThermalPrinter.getBluetoothDeviceList();

    if (!devices || devices.length === 0) {
      return {
        success: false,
        error: 'Nu s-a găsit imprimanta Bluetooth',
      };
    }

    const device = devices[0];

    const ESC = '\x1B';
    const ALIGN_CENTER = ESC + 'a' + '\x01';
    const BOLD_ON = ESC + 'E' + '\x01';
    const BOLD_OFF = ESC + 'E' + '\x00';
    const FEED_LINE = '\n';

    const testLabel = `${ALIGN_CENTER}${BOLD_ON}TEST IMPRIMARE${BOLD_OFF}${FEED_LINE}
${FEED_LINE}
Imprimanta Sunmi T2S${FEED_LINE}
Etichetă 62mm x 50mm${FEED_LINE}
${FEED_LINE}
═══════════════${FEED_LINE}
${FEED_LINE}${FEED_LINE}`;

    await RNThermalPrinter.printBluetooth({
      payload: testLabel,
      printerNbrCharactersPerLine: 32,
      ...device,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error printing test label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
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
    const devices = await RNThermalPrinter.getBluetoothDeviceList();

    if (!devices || devices.length === 0) {
      return {
        success: false,
        printed: 0,
        error: 'Nu s-a găsit imprimanta Bluetooth',
      };
    }

    const device = devices[0];
    let printedCount = 0;

    for (const ticket of tickets) {
      try {
        const labelText = generateLabelText(ticket);

        await RNThermalPrinter.printBluetooth({
          payload: labelText,
          printerNbrCharactersPerLine: 32,
          ...device,
        });

        printedCount++;
      } catch (e) {
        console.error('Error printing ticket:', e);
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
