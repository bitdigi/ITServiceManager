/**
 * Sunmi Native Printer Module
 * TypeScript wrapper for native React Native module
 * Uses AIDL binding to SunmiPrinterService
 */

import { NativeModules } from 'react-native';

const { SunmiPrinter } = NativeModules;

if (!SunmiPrinter) {
  console.warn('SunmiPrinter native module not available');
}

export interface PrinterStatus {
  status: number;
  message: string;
}

export interface PrintResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Connect to Sunmi printer service
 */
export async function connect(): Promise<string> {
  try {
    const result = await SunmiPrinter.connect();
    console.log('[SunmiNativePrinter] Connected:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from printer
 */
export async function disconnect(): Promise<string> {
  try {
    const result = await SunmiPrinter.disconnect();
    console.log('[SunmiNativePrinter] Disconnected:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Disconnection error:', error);
    throw error;
  }
}

/**
 * Check if printer is connected
 */
export async function isConnected(): Promise<boolean> {
  try {
    const result = await SunmiPrinter.isConnected();
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Check error:', error);
    return false;
  }
}

/**
 * Initialize printer
 */
export async function printerInit(): Promise<string> {
  try {
    const result = await SunmiPrinter.printerInit();
    console.log('[SunmiNativePrinter] Initialized:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Init error:', error);
    throw error;
  }
}

/**
 * Get printer status
 */
export async function getPrinterStatus(): Promise<PrinterStatus> {
  try {
    const result = await SunmiPrinter.getPrinterStatus();
    console.log('[SunmiNativePrinter] Status:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Status error:', error);
    throw error;
  }
}

/**
 * Set printer mode
 * @param mode 0=normal, 1=label
 */
export async function setPrinterMode(mode: number): Promise<string> {
  try {
    const result = await SunmiPrinter.setPrinterMode(mode);
    console.log('[SunmiNativePrinter] Mode set:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Mode error:', error);
    throw error;
  }
}

/**
 * Print text
 */
export async function printText(text: string): Promise<string> {
  try {
    const result = await SunmiPrinter.printText(text);
    console.log('[SunmiNativePrinter] Text printed:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Print text error:', error);
    throw error;
  }
}

/**
 * Print bitmap from base64 image
 */
export async function printBitmap(base64Image: string): Promise<string> {
  try {
    const result = await SunmiPrinter.printBitmap(base64Image);
    console.log('[SunmiNativePrinter] Bitmap printed:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Print bitmap error:', error);
    throw error;
  }
}

/**
 * Set font size
 */
export async function setFontSize(size: number): Promise<string> {
  try {
    const result = await SunmiPrinter.setFontSize(size);
    console.log('[SunmiNativePrinter] Font size set:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Font size error:', error);
    throw error;
  }
}

/**
 * Set alignment
 * @param alignment 0=left, 1=center, 2=right
 */
export async function setAlignment(alignment: number): Promise<string> {
  try {
    const result = await SunmiPrinter.setAlignment(alignment);
    console.log('[SunmiNativePrinter] Alignment set:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Alignment error:', error);
    throw error;
  }
}

/**
 * Line wrap
 */
export async function lineWrap(lines: number): Promise<string> {
  try {
    const result = await SunmiPrinter.lineWrap(lines);
    console.log('[SunmiNativePrinter] Line wrap:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Line wrap error:', error);
    throw error;
  }
}

/**
 * Print QR code
 * @param data QR code data (e.g., deep link)
 * @param moduleSize QR code module size (default 8)
 * @param errorLevel Error correction level (0=L, 1=M, 2=Q, 3=H)
 */
export async function printQRCode(
  data: string,
  moduleSize: number = 8,
  errorLevel: number = 3,
): Promise<string> {
  try {
    const result = await SunmiPrinter.printQRCode(data, moduleSize, errorLevel);
    console.log('[SunmiNativePrinter] QR code printed:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] QR code error:', error);
    throw error;
  }
}

/**
 * Label locate (for label paper)
 */
export async function labelLocate(): Promise<string> {
  try {
    const result = await SunmiPrinter.labelLocate();
    console.log('[SunmiNativePrinter] Label located:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Label locate error:', error);
    throw error;
  }
}

/**
 * Label output (for label paper)
 */
export async function labelOutput(): Promise<string> {
  try {
    const result = await SunmiPrinter.labelOutput();
    console.log('[SunmiNativePrinter] Label output:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Label output error:', error);
    throw error;
  }
}

/**
 * Get firmware version
 */
export async function getFirmwareVersion(): Promise<string> {
  try {
    const result = await SunmiPrinter.getFirmwareVersion();
    console.log('[SunmiNativePrinter] Firmware version:', result);
    return result;
  } catch (error) {
    console.error('[SunmiNativePrinter] Firmware version error:', error);
    return 'Unknown';
  }
}
