/**
 * Telegram Sync Service
 * Handles retrieving and parsing tickets from Telegram messages
 */

import { ServiceTicket, ProductType, TicketStatus } from '@/types/ticket';
import { ticketStorage } from './storage';

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * Parse ticket data from Telegram message text
 */
function parseTicketFromMessage(text: string): Partial<ServiceTicket> | null {
  try {
    // Try to parse as JSON first (if we sent it as structured data)
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
          technicianName: data.technicianName || 'Technician',
          dateReceived: data.dateReceived || new Date().toISOString(),
          dateDelivered: data.dateDelivered || null,
          telegramSent: true,
          telegramMessageId: data.telegramMessageId || null,
        };
      }
    } catch (e) {
      // Not JSON, try parsing as formatted text
    }

    // Parse formatted text message
    // Expected format: "Client: John\nPhone: 0712345678\nProduct: Laptop\n..."
    const lines = text.split('\n');
    const data: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes('client')) data.clientName = value;
        else if (lowerKey.includes('phone')) data.clientPhone = value;
        else if (lowerKey.includes('email')) data.clientEmail = value;
        else if (lowerKey.includes('product') && lowerKey.includes('type')) data.productType = value.toLowerCase();
        else if (lowerKey.includes('model')) data.productModel = value;
        else if (lowerKey.includes('serial')) data.productSerialNumber = value;
        else if (lowerKey.includes('problem')) data.problemDescription = value;
        else if (lowerKey.includes('diagnostic')) data.diagnostic = value;
        else if (lowerKey.includes('solution')) data.solutionApplied = value;
        else if (lowerKey.includes('cost')) data.cost = parseFloat(value) || 0;
        else if (lowerKey.includes('status')) data.status = value.toLowerCase();
        else if (lowerKey.includes('technician')) data.technicianName = value;
      }
    }

    if (data.clientName && data.productType) {
      return {
        clientName: data.clientName,
        clientPhone: data.clientPhone || '',
        clientEmail: data.clientEmail || '',
        productType: (data.productType || 'laptop') as ProductType,
        productModel: data.productModel || '',
        productSerialNumber: data.productSerialNumber || '',
        problemDescription: data.problemDescription || '',
        diagnostic: data.diagnostic || '',
        solutionApplied: data.solutionApplied || '',
        cost: data.cost || 0,
        status: (data.status || 'pending') as TicketStatus,
        technicianName: data.technicianName || 'Technician',
        dateReceived: new Date().toISOString(),
        dateDelivered: null,
        telegramSent: true,
        telegramMessageId: null,
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing ticket from message:', error);
    return null;
  }
}

/**
 * Sync tickets from Telegram
 * Retrieves recent messages from Telegram group and imports them as tickets
 */
export async function syncTicketsFromTelegram(
  botToken: string,
  chatId: string,
  lastMessageId?: number
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!botToken || !chatId) {
      return { success: false, count: 0, error: 'Bot token or chat ID not configured' };
    }

    // Get updates from Telegram
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?allowed_updates=message`;
    const response = await fetch(url);

    if (!response.ok) {
      return { success: false, count: 0, error: `Telegram API error: ${response.status}` };
    }

    const data = await response.json();

    if (!data.ok) {
      return { success: false, count: 0, error: data.description || 'Telegram API error' };
    }

    // Get existing tickets to avoid duplicates
    const existingTickets = await ticketStorage.getAllTickets();
    const existingMessageIds = new Set(
      existingTickets
        .filter(t => t.telegramMessageId)
        .map(t => t.telegramMessageId)
    );

    let importedCount = 0;

    // Process messages
    for (const update of data.result) {
      const message = update.message;

      if (
        message &&
        message.chat &&
        message.chat.id === parseInt(chatId) &&
        message.text &&
        !existingMessageIds.has(message.message_id)
      ) {
        // Try to parse ticket from message
        const ticketData = parseTicketFromMessage(message.text);

        if (ticketData) {
          try {
            // Add ticket with Telegram message ID
            await ticketStorage.createTicket({
              ...(ticketData as Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt'>),
              telegramMessageId: message.message_id.toString(),
            });
            importedCount++;
          } catch (error) {
            console.error('Error importing ticket:', error);
          }
        }
      }
    }

    return { success: true, count: importedCount };
  } catch (error) {
    console.error('Error syncing from Telegram:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
