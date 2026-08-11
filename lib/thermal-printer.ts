/**
 * Legacy compatibility module. Bluetooth printing was explicitly removed from
 * this project because the Sunmi T2S uses its integrated printer, not Bluetooth.
 * Printable 62 mm PDF labels are sent through Telegram for the Brother QL-500.
 */
import { ServiceTicket } from '@/types/ticket';

const UNSUPPORTED_MESSAGE = 'Imprimarea Bluetooth nu este disponibilă. Folosește eticheta PDF trimisă pe Telegram.';

export async function printLabel(_ticket: ServiceTicket): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: UNSUPPORTED_MESSAGE };
}

export async function getAvailablePrinters(): Promise<{ devices: never[]; error?: string }> {
  return { devices: [], error: UNSUPPORTED_MESSAGE };
}

export async function printTestLabel(): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: UNSUPPORTED_MESSAGE };
}

export async function printMultipleLabels(_tickets: ServiceTicket[]): Promise<{
  success: boolean;
  printed: number;
  error?: string;
}> {
  return { success: false, printed: 0, error: UNSUPPORTED_MESSAGE };
}
