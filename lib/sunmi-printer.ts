/**
 * Sunmi Thermal Printer Service
 * Uses native Sunmi printer module via AIDL binding
 * Label format: 62mm width x 50mm height
 * Includes QR code for deep link to ticket
 */

import * as nativePrinter from './sunmi-native-printer';
import type { ServiceTicket } from '@/types/ticket';

/**
 * Initialize printer connection
 */
export async function initializePrinter(): Promise<{ success: boolean; error?: string }> {
  try {
    // Connect to printer service
    await nativePrinter.connect();
    
    // Initialize printer
    await nativePrinter.printerInit();
    
    // Set label mode
    await nativePrinter.setPrinterMode(1); // 1 = label mode
    
    console.log('[SunmiPrinter] Printer initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('[SunmiPrinter] Initialization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Print a single ticket label (62mm x 50mm)
 */
export async function printLabel(ticket: ServiceTicket): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if printer is connected
    const connected = await nativePrinter.isConnected();
    if (!connected) {
      // Try to connect
      await nativePrinter.connect();
    }
    
    // Initialize printer
    await nativePrinter.printerInit();
    
    // Set label mode
    await nativePrinter.setPrinterMode(1); // 1 = label mode
    
    // Label locate (for label paper)
    await nativePrinter.labelLocate();
    
    // Set alignment to center
    await nativePrinter.setAlignment(1); // 1 = center
    
    // Set font size for header
    await nativePrinter.setFontSize(28);
    
    // Print header
    await nativePrinter.printText('FIȘĂ SERVICE');
    await nativePrinter.lineWrap(1);
    
    // Set font size for info
    await nativePrinter.setFontSize(24);
    
    // Print ticket info
    await nativePrinter.setAlignment(0); // 0 = left
    await nativePrinter.printText(`ID: ${ticket.id.substring(0, 8)}`);
    await nativePrinter.printText(`TEL: ${ticket.clientPhone}`);
    
    const formattedDate = new Date(ticket.createdAt).toLocaleDateString('ro-RO');
    await nativePrinter.printText(`DATA: ${formattedDate}`);
    
    await nativePrinter.lineWrap(1);
    
    // Print defect description
    const defectText = ticket.defectDescription.length > 40
      ? ticket.defectDescription.substring(0, 37) + '...'
      : ticket.defectDescription;
    await nativePrinter.printText(`Defect: ${defectText}`);
    
    await nativePrinter.lineWrap(1);
    
    // Print QR code
    const deepLink = `manusapp://ticket/${ticket.id}`;
    await nativePrinter.setAlignment(1); // center
    await nativePrinter.printQRCode(deepLink, 8, 3); // moduleSize=8, errorLevel=3 (high)
    
    await nativePrinter.lineWrap(1);
    
    // Print Telegram fallback link if available
    if (ticket.telegramGroupId && ticket.telegramMessageId) {
      const telegramLink = `t.me/c/${ticket.telegramGroupId}/${ticket.telegramMessageId}`;
      await nativePrinter.setFontSize(20);
      await nativePrinter.printText(telegramLink);
    }
    
    await nativePrinter.lineWrap(2);
    
    // Label output (eject label)
    await nativePrinter.labelOutput();
    
    console.log('[SunmiPrinter] Label printed successfully');
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
    for (let i = 0; i < count; i++) {
      const result = await printLabel(ticket);
      if (!result.success) {
        return result;
      }
    }
    
    console.log('[SunmiPrinter] Multiple labels printed successfully');
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
  try {
    const status = await nativePrinter.getPrinterStatus();
    return {
      available: status.status === 0,
      message: status.message,
    };
  } catch (error) {
    return {
      available: false,
      message: 'Imprimanta nu este disponibilă',
    };
  }
}

/**
 * Disconnect from printer
 */
export async function disconnectPrinter(): Promise<void> {
  try {
    await nativePrinter.disconnect();
    console.log('[SunmiPrinter] Disconnected');
  } catch (error) {
    console.error('[SunmiPrinter] Disconnect error:', error);
  }
}

/**
 * Get firmware version
 */
export async function getFirmwareVersion(): Promise<string> {
  try {
    return await nativePrinter.getFirmwareVersion();
  } catch (error) {
    console.error('[SunmiPrinter] Firmware version error:', error);
    return 'Unknown';
  }
}
