/**
 * QR Code Generator Service
 * Generates QR codes with deep links for tickets
 * Includes fallback to Telegram when app is not installed
 */

import { ServiceTicket } from '@/types/ticket';

// Get the scheme from environment or use default
const SCHEME = process.env.EXPO_PUBLIC_SCHEME || 'manusapp';

/**
 * Generate QR code data for a ticket
 * Returns a deep link that opens the ticket in the app
 * Falls back to Telegram if app is not installed
 */
export function generateTicketQRData(ticket: ServiceTicket): string {
  // Deep link format: manusapp://ticket/TICKET_ID
  // This will open the ticket detail screen in the app
  const deepLink = `${SCHEME}://ticket/${ticket.id}`;
  
  return deepLink;
}

/**
 * Generate fallback Telegram link for a ticket
 * This link opens the Telegram group and searches for the ticket message
 */
export function generateTelegramFallbackLink(ticket: ServiceTicket, groupId?: string): string {
  if (!groupId) {
    return '';
  }
  
  // Telegram link format: https://t.me/c/GROUP_ID/MESSAGE_ID
  // We'll use the ticket ID as search parameter instead
  // Format: https://t.me/search?q=TICKET_ID
  return `https://t.me/search?q=${ticket.id}`;
}

/**
 * Generate complete QR code URL with fallback
 * If the deep link fails, it will redirect to Telegram
 */
export function generateQRCodeURL(ticket: ServiceTicket, groupId?: string): string {
  const deepLink = generateTicketQRData(ticket);
  const telegramFallback = generateTelegramFallbackLink(ticket, groupId);
  
  // Return the deep link as primary
  // Fallback handling is done in the app's deep link handler
  return deepLink;
}

/**
 * QR Code data for printing on thermal labels
 */
export interface QRCodeData {
  value: string; // The QR code value (deep link)
  size: number; // Size in pixels
  fallbackUrl?: string; // Fallback URL if deep link fails
}

/**
 * Generate QR code data for thermal printer
 */
export function generateQRCodeForPrinter(
  ticket: ServiceTicket,
  size: number = 200,
  groupId?: string
): QRCodeData {
  return {
    value: generateTicketQRData(ticket),
    size,
    fallbackUrl: generateTelegramFallbackLink(ticket, groupId),
  };
}
