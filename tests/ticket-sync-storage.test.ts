import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => memory.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      memory.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      memory.delete(key);
    }),
  },
}));

import { ticketStorage } from '../lib/storage';

const baseTicket = {
  id: '1781073965530-ic5c3jt8c',
  clientName: 'Test',
  clientPhone: '0757',
  clientEmail: '',
  productType: 'laptop' as const,
  productModel: 'Asus',
  productSerialNumber: '',
  problemDescription: 'Test',
  diagnostic: 'Test',
  solutionApplied: 'Test',
  cost: 100,
  status: 'pending' as const,
  technicianName: 'Geo',
  dateReceived: '2026-06-10T06:45:37.771Z',
  dateDelivered: null,
  telegramSent: true,
  telegramMessageId: null,
  createdAt: '2026-06-10T06:45:37.771Z',
  updatedAt: '2026-06-10T06:45:37.771Z',
};

describe('shared ticket merge', () => {
  beforeEach(() => memory.clear());

  it('imports a remote ticket without generating a replacement local ID', async () => {
    const result = await ticketStorage.mergeRemoteTickets([{ ...baseTicket, deletedAt: null }]);
    const tickets = await ticketStorage.getAllTickets();

    expect(result).toEqual({ imported: 1, updated: 0, deleted: 0 });
    expect(tickets).toHaveLength(1);
    expect(tickets[0].id).toBe(baseTicket.id);
  });

  it('removes a local ticket after receiving a newer remote deletion tombstone', async () => {
    await ticketStorage.mergeRemoteTickets([{ ...baseTicket, deletedAt: null }]);
    const result = await ticketStorage.mergeRemoteTickets([
      {
        ...baseTicket,
        updatedAt: '2026-06-11T06:45:37.771Z',
        deletedAt: '2026-06-11T06:45:37.771Z',
      },
    ]);

    expect(result).toEqual({ imported: 0, updated: 0, deleted: 1 });
    await expect(ticketStorage.getAllTickets()).resolves.toEqual([]);
  });

  it('queues a local deletion for delivery before the next backend pull', async () => {
    await ticketStorage.mergeRemoteTickets([{ ...baseTicket, deletedAt: null }]);

    await expect(ticketStorage.deleteTicket(baseTicket.id)).resolves.toBe(true);
    await expect(ticketStorage.getPendingDeletions()).resolves.toEqual([
      expect.objectContaining({ id: baseTicket.id }),
    ]);
  });
});
