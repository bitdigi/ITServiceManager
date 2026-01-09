/**
 * Telegram Service
 * Handles sending service tickets to Telegram group
 */

import { ServiceTicket, ProductType, TicketStatus } from '@/types/ticket';
import { settingsStorage, ticketStorage } from './storage';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

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
 * Format status for display
 */
function formatStatus(status: TicketStatus): string {
  const statusNames: Record<TicketStatus, string> = {
    pending: '⏳ În așteptare',
    in_progress: '🔧 În curs',
    completed: '✅ Finalizat',
    on_hold: '⏸️ Suspendat',
  };
  return statusNames[status];
}

/**
 * Format ticket data as JSON for sync
 */
function formatTicketAsJSON(ticket: ServiceTicket): string {
  return JSON.stringify({
    id: ticket.id,
    clientName: ticket.clientName,
    clientPhone: ticket.clientPhone,
    clientEmail: ticket.clientEmail,
    productType: ticket.productType,
    productModel: ticket.productModel,
    productSerialNumber: ticket.productSerialNumber,
    problemDescription: ticket.problemDescription,
    diagnostic: ticket.diagnostic,
    solutionApplied: ticket.solutionApplied,
    cost: ticket.cost,
    status: ticket.status,
    technicianName: ticket.technicianName,
    dateReceived: ticket.dateReceived,
    dateDelivered: ticket.dateDelivered,
    telegramSent: true,
    telegramMessageId: ticket.telegramMessageId,
  });
}

/**
 * Format ticket data as Telegram message
 */
function formatTicketMessage(ticket: ServiceTicket): string {
  const message = `
📋 <b>FIȘĂ DE SERVICE</b>

<b>👤 CLIENT:</b>
• Nume: ${ticket.clientName}
• Telefon: ${ticket.clientPhone}
• Email: ${ticket.clientEmail}

<b>📱 PRODUS:</b>
• Tip: ${formatProductType(ticket.productType)}
• Model: ${ticket.productModel}
• Serie: ${ticket.productSerialNumber}

<b>🔍 DIAGNOSTIC:</b>
${ticket.problemDescription}

<b>🛠️ SOLUȚIE:</b>
${ticket.solutionApplied}

<b>💰 COST:</b> ${ticket.cost} RON

<b>👨‍🔧 TEHNICIAN:</b> ${ticket.technicianName}

<b>📅 DATE:</b>
• Primit: ${new Date(ticket.dateReceived).toLocaleDateString('ro-RO')}
• Predat: ${ticket.dateDelivered ? new Date(ticket.dateDelivered).toLocaleDateString('ro-RO') : 'N/A'}

<b>📊 STATUS:</b> ${formatStatus(ticket.status)}

<i>ID: ${ticket.id}</i>
`;
  return message.trim();
}

/**
 * Send ticket to Telegram
 */
export async function sendTicketToTelegram(ticket: ServiceTicket): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Get Telegram config
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      return {
        success: false,
        error: 'Telegram configuration is missing. Please configure bot token and group ID in settings.',
      };
    }

    // Format message with JSON data
    const message = formatTicketMessage(ticket);
    const jsonData = formatTicketAsJSON(ticket);
    const fullMessage = message + '\n\n```json\n' + jsonData + '\n```';

    // Send to Telegram
    const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.groupId,
        text: fullMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return {
        success: false,
        error: data.description || 'Failed to send message to Telegram',
      };
    }

    return {
      success: true,
      messageId: String(data.result.message_id),
    };
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send update notification to Telegram
 */
export async function sendUpdateToTelegram(ticket: ServiceTicket): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      return {
        success: false,
        error: 'Telegram configuration is missing.',
      };
    }

    const jsonData = formatTicketAsJSON(ticket);
    const message = `
🔄 <b>ACTUALIZARE FIȘĂ</b>

${formatTicketMessage(ticket)}

<i>Actualizat: ${new Date().toLocaleString('ro-RO')}</i>

\`\`\`json
${jsonData}
\`\`\`
`;

    const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.groupId,
        text: message.trim(),
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: data.description || 'Failed to send update to Telegram',
      };
    }

    return {
      success: true,
      messageId: String(data.result.message_id),
    };
  } catch (error) {
    console.error('Error sending update to Telegram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get chat history and extract tickets
 */
export async function getTicketsFromTelegramHistory(): Promise<ServiceTicket[]> {
  try {
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      console.error('Telegram configuration is missing');
      return [];
    }

    // Get recent messages from the group
    const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/getUpdates`;

    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Failed to get updates from Telegram:', data);
      return [];
    }

    const tickets: ServiceTicket[] = [];
    const processedIds = new Set<string>();

    // Extract JSON data from messages
    if (data.result && Array.isArray(data.result)) {
      for (const update of data.result) {
        if (update.message && update.message.text) {
          const text = update.message.text;
          // Look for JSON in code blocks
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              const ticketData = JSON.parse(jsonMatch[1]);
              if (ticketData.id && !processedIds.has(ticketData.id)) {
                tickets.push(ticketData as ServiceTicket);
                processedIds.add(ticketData.id);
              }
            } catch (e) {
              console.error('Failed to parse JSON from message:', e);
            }
          }
        }
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error getting tickets from Telegram:', error);
    return [];
  }
}

/**
 * Sync tickets from Telegram and add missing ones to local storage
 */
export async function syncTicketsFromTelegramAuto(): Promise<{
  success: boolean;
  imported: number;
  error?: string;
}> {
  try {
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      return {
        success: false,
        imported: 0,
        error: 'Telegram configuration is missing',
      };
    }

    // Get tickets from Telegram
    const telegramTickets = await getTicketsFromTelegramHistory();

    if (telegramTickets.length === 0) {
      return {
        success: true,
        imported: 0,
      };
    }

    // Get local tickets
    const localTickets = await ticketStorage.getAllTickets();
    const localIds = new Set(localTickets.map(t => t.id));

    // Import missing tickets
    let importedCount = 0;
    for (const ticket of telegramTickets) {
      if (!localIds.has(ticket.id)) {
        try {
          await ticketStorage.createTicket({
            clientName: ticket.clientName,
            clientPhone: ticket.clientPhone,
            clientEmail: ticket.clientEmail,
            productType: ticket.productType,
            productModel: ticket.productModel,
            productSerialNumber: ticket.productSerialNumber,
            problemDescription: ticket.problemDescription,
            diagnostic: ticket.diagnostic,
            solutionApplied: ticket.solutionApplied,
            cost: ticket.cost,
            status: ticket.status,
            technicianName: ticket.technicianName,
            dateReceived: ticket.dateReceived,
            dateDelivered: ticket.dateDelivered,
            telegramSent: true,
            telegramMessageId: ticket.telegramMessageId,
          });
          importedCount++;
        } catch (e) {
          console.error('Failed to import ticket:', e);
        }
      }
    }

    return {
      success: true,
      imported: importedCount,
    };
  } catch (error) {
    console.error('Error syncing from Telegram:', error);
    return {
      success: false,
      imported: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      return {
        success: false,
        error: 'Telegram configuration is missing.',
      };
    }

    const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/getMe`;

    const response = await fetch(url, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: 'Invalid bot token',
      };
    }

    // Test sending to group
    const testUrl = `${TELEGRAM_API_BASE}/bot${config.botToken}/sendMessage`;
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.groupId,
        text: '✅ Conexiune Telegram testată cu succes!',
        parse_mode: 'HTML',
      }),
    });

    const testData = await testResponse.json();

    if (!testResponse.ok || !testData.ok) {
      return {
        success: false,
        error: 'Invalid group ID or bot does not have permission to send messages',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error testing Telegram connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete message from Telegram
 */
export async function deleteMessageFromTelegram(
  messageId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const config = await settingsStorage.getTelegramConfig();

    if (!config.botToken || !config.groupId) {
      return {
        success: false,
        error: 'Telegram configuration is missing.',
      };
    }

    if (!messageId) {
      return {
        success: false,
        error: 'Message ID is missing.',
      };
    }

    const url = `${TELEGRAM_API_BASE}/bot${config.botToken}/deleteMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.groupId,
        message_id: parseInt(messageId),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram delete error:', data);
      return {
        success: false,
        error: data.description || 'Failed to delete message from Telegram',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting from Telegram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
