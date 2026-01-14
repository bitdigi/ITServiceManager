/**
 * QR Code Generator Service
 * Generates QR codes as base64 PNG images for embedding in labels
 */

import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate QR code as base64 PNG image
 */
export async function generateQRCodeImage(
  text: string,
  options: QRCodeOptions = {},
): Promise<string> {
  try {
    const {
      width = 200,
      margin = 1,
      color = { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel = 'H',
    } = options;

    // Generate QR code as data URL (PNG)
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin,
      color,
      errorCorrectionLevel,
      type: 'image/png',
    });

    return dataUrl;
  } catch (error) {
    console.error('[QRCodeGenerator] Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate QR code for ticket (deep link with Telegram fallback)
 */
export async function generateTicketQRCode(
  ticketId: string,
  telegramGroupId?: string,
  telegramMessageId?: number,
): Promise<string> {
  try {
    // Generate deep link: manusapp://ticket/TICKET_ID
    const deepLink = `manusapp://ticket/${ticketId}`;

    // If Telegram info available, add as comment in QR code metadata
    // (QR code itself contains deep link, fallback is handled by app)
    const qrCodeImage = await generateQRCodeImage(deepLink, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    return qrCodeImage;
  } catch (error) {
    console.error('[QRCodeGenerator] Error generating ticket QR code:', error);
    throw error;
  }
}

/**
 * Generate QR code for product label
 */
export async function generateProductQRCode(productId: string): Promise<string> {
  try {
    const qrCodeImage = await generateQRCodeImage(`product://${productId}`, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    return qrCodeImage;
  } catch (error) {
    console.error('[QRCodeGenerator] Error generating product QR code:', error);
    throw error;
  }
}

/**
 * Generate QR code with custom text
 */
export async function generateCustomQRCode(text: string, size: number = 150): Promise<string> {
  try {
    const qrCodeImage = await generateQRCodeImage(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    return qrCodeImage;
  } catch (error) {
    console.error('[QRCodeGenerator] Error generating custom QR code:', error);
    throw error;
  }
}
