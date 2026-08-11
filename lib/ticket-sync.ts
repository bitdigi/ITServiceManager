/**
 * Shared backend synchronization for service tickets.
 * Telegram continues to be used for notifications and printable labels; it is
 * not a data store and therefore is no longer used to recover ticket history.
 */

import { createTRPCClient } from '@/lib/trpc';
import { ServiceTicket } from '@/types/ticket';
import { settingsStorage, ticketStorage } from './storage';

type RemoteServiceTicket = ServiceTicket & { deletedAt: string | null };

type SyncResult = {
  success: boolean;
  imported: number;
  updated: number;
  deleted: number;
  uploaded: number;
  error?: string;
};

async function getSyncToken(): Promise<string> {
  const config = await settingsStorage.getTelegramConfig();
  if (!config.botToken) {
    throw new Error('Configurează token-ul botului Telegram înainte de sincronizare.');
  }
  return config.botToken;
}

function getClient() {
  return createTRPCClient();
}

/** Push one current ticket immediately after create or edit. */
export async function upsertTicketToBackend(ticket: ServiceTicket): Promise<boolean> {
  try {
    const syncToken = await getSyncToken();
    await getClient().tickets.upsert.mutate({ ...ticket, deletedAt: null, syncToken });
    return true;
  } catch (error) {
    console.warn('Ticket was saved locally but could not be synchronized:', error);
    return false;
  }
}

/** Publish a deletion as a tombstone, allowing other devices to remove the ticket. */
export async function deleteTicketFromBackend(id: string, updatedAt = new Date().toISOString()): Promise<boolean> {
  try {
    const syncToken = await getSyncToken();
    const result = await getClient().tickets.delete.mutate({ id, updatedAt, syncToken });
    // Any non-network response means the deletion is no longer retryable. If
    // it was stale, the later pull restores the newer remote version instead.
    await ticketStorage.clearPendingDeletion(id);
    return result.applied;
  } catch (error) {
    console.warn('Ticket was deleted locally but could not be synchronized:', error);
    return false;
  }
}

/**
 * Pull first to apply remote updates and deletions, then push the local snapshot.
 * This order prevents a stale local record from recreating a ticket that another
 * phone has already deleted.
 */
export async function syncTicketsWithBackend(): Promise<SyncResult> {
  try {
    const syncToken = await getSyncToken();
    const client = getClient();

    // Deliver queued deletions before pulling records. This order prevents a
    // ticket removed while offline from being restored by an older server copy.
    const pendingDeletions = await ticketStorage.getPendingDeletions();
    for (const deletion of pendingDeletions) {
      await client.tickets.delete.mutate({ ...deletion, syncToken });
      await ticketStorage.clearPendingDeletion(deletion.id);
    }

    const remoteTickets = (await client.tickets.list.query({ syncToken })) as RemoteServiceTicket[];
    const merged = await ticketStorage.mergeRemoteTickets(remoteTickets);

    const localTickets = await ticketStorage.getAllTickets();
    let uploaded = 0;
    for (const ticket of localTickets) {
      const result = await client.tickets.upsert.mutate({ ...ticket, deletedAt: null, syncToken });
      if (result.applied) uploaded++;
    }

    return { success: true, ...merged, uploaded };
  } catch (error) {
    console.error('Backend ticket synchronization failed:', error);
    return {
      success: false,
      imported: 0,
      updated: 0,
      deleted: 0,
      uploaded: 0,
      error: error instanceof Error ? error.message : 'Eroare necunoscută la sincronizare',
    };
  }
}
