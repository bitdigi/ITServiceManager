/**
 * Telegram Sync Service
 * Handles retrieving and parsing tickets from Telegram messages
 */

import { ServiceTicket, ProductType, TicketStatus } from '@/types/ticket';
import { ticketStorage } from './storage';

/**
 * Parse ticket data from Telegram message text
 */
function parseTicketFromMessage(text: string): Partial<ServiceTicket> | null {
  try {
    // Try to parse as JSON first
    try {
      const data = JSON.parse(text);
      if (data.clientName && data.productType) {
        return {
          clientName: data.clientName,
          clientPhone: data.clientPhone || '',
          clientEmail: data.clientEmail || '',
          productType: data.productType as ProductType,
          productModel: data.productModel || '',
          productSerialNumber: data.productSerialNumber || '',
          problemDescription: data.problemDescription || '',
          diagnostic: data.diagnostic || '',
          solutionApplied: data.solutionApplied || '',
          cost: data.cost || 0,
          status: (data.status || 'pending') as TicketStatus,
          technicianName: data.technicianName || 'Tehnician',
          dateReceived: data.dateReceived || new Date().toISOString(),
          dateDelivered: data.dateDelivered || null,
          telegramSent: true,
          telegramMessageId: data.telegramMessageId || null,
        };
      }
    } catch (e) {
      // Not JSON, continue
    }

    return null;
  } catch (error) {
    console.error('Error parsing ticket from message:', error);
    return null;
  }
}

/**
 * Sync tickets from Telegram
 * Note: This is a simplified version that validates configuration
 * Full sync would require using Telegram Client API or webhooks
 */
export async function syncTicketsFromTelegram(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!botToken || !chatId) {
      return { success: false, count: 0, error: 'Token-ul Telegram sau ID-ul grupului nu sunt configurate' };
    }

    // Validate bot token format
    if (!botToken.includes(':')) {
      return { success: false, count: 0, error: 'Token-ul Telegram este invalid' };
    }

    // Validate chat ID format
    if (isNaN(parseInt(chatId))) {
      return { success: false, count: 0, error: 'ID-ul grupului Telegram este invalid' };
    }

    // Test bot token by getting bot info
    try {
      const testUrl = `https://api.telegram.org/bot${botToken}/getMe`;
      const testResponse = await fetch(testUrl);
      
      if (!testResponse.ok) {
        if (testResponse.status === 409) {
          return { success: false, count: 0, error: 'Conflict: Verificați token-ul Telegram' };
        }
        return { success: false, count: 0, error: `Eroare Telegram: ${testResponse.status}` };
      }

      const testData = await testResponse.json();
      if (!testData.ok) {
        return { success: false, count: 0, error: 'Token-ul Telegram este invalid' };
      }
    } catch (error) {
      return { success: false, count: 0, error: 'Nu se poate conecta la Telegram API' };
    }

    // In a real implementation, you would use:
    // 1. Telegram Client API (TDLib) to get chat history
    // 2. Or set up webhooks to receive messages
    // 3. Or use a bot that logs messages to a database

    // For now, return success with 0 imported tickets
    // Users should manually send formatted messages to the group
    return { 
      success: true, 
      count: 0, 
      error: 'Sincronizarea automată necesită configurare avansată. Trimiteți fișele în format JSON în grupul Telegram.' 
    };
  } catch (error) {
    console.error('Error syncing from Telegram:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Eroare necunoscută',
    };
  }
}
