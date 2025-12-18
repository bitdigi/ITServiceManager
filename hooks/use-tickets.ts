/**
 * useTickets Hook
 * Manages ticket state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { ServiceTicket, FilterOptions } from '@/types/ticket';
import { ticketStorage } from '@/lib/storage';

export function useTickets() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all tickets
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketStorage.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Create ticket
  const createTicket = useCallback(
    async (data: Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null);
        const newTicket = await ticketStorage.createTicket(data);
        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create ticket';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Update ticket
  const updateTicket = useCallback(async (id: string, data: Partial<Omit<ServiceTicket, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      const updated = await ticketStorage.updateTicket(id, data);
      if (updated) {
        setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(message);
      throw err;
    }
  }, []);

  // Delete ticket
  const deleteTicket = useCallback(async (id: string) => {
    try {
      setError(null);
      const success = await ticketStorage.deleteTicket(id);
      if (success) {
        setTickets(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete ticket';
      setError(message);
      throw err;
    }
  }, []);

  // Get ticket by ID
  const getTicketById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await ticketStorage.getTicketById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get ticket';
      setError(message);
      return null;
    }
  }, []);

  // Filter tickets
  const filterTickets = useCallback(async (options: FilterOptions) => {
    try {
      setError(null);
      return await ticketStorage.filterTickets(options);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to filter tickets';
      setError(message);
      return [];
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    loadTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    filterTickets,
  };
}
