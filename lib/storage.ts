/**
 * Storage Service
 * Handles all AsyncStorage operations for tickets and settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { ServiceTicket, TelegramConfig, AppSettings, FilterOptions, ProductType, TicketStatus } from '@/types/ticket';

const TICKETS_KEY = '@it_service_manager/tickets';
const SETTINGS_KEY = '@it_service_manager/settings';
const TELEGRAM_CONFIG_KEY = '@it_service_manager/telegram_config';

/**
 * Ticket Operations
 */
export const ticketStorage = {
  /**
   * Get all tickets
   */
  async getAllTickets(): Promise<ServiceTicket[]> {
    try {
      const data = await AsyncStorage.getItem(TICKETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all tickets:', error);
      return [];
    }
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id: string): Promise<ServiceTicket | null> {
    try {
      const tickets = await this.getAllTickets();
      return tickets.find(t => t.id === id) || null;
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      return null;
    }
  },

  /**
   * Create new ticket
   */
  async createTicket(data: Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceTicket> {
    try {
      const ticket: ServiceTicket = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tickets = await this.getAllTickets();
      tickets.push(ticket);
      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  /**
   * Update existing ticket
   */
  async updateTicket(id: string, data: Partial<Omit<ServiceTicket, 'id' | 'createdAt'>>): Promise<ServiceTicket | null> {
    try {
      const tickets = await this.getAllTickets();
      const index = tickets.findIndex(t => t.id === id);

      if (index === -1) {
        console.error('Ticket not found:', id);
        return null;
      }

      tickets[index] = {
        ...tickets[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
      return tickets[index];
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  /**
   * Delete ticket
   */
  async deleteTicket(id: string): Promise<boolean> {
    try {
      const tickets = await this.getAllTickets();
      const filtered = tickets.filter(t => t.id !== id);

      if (filtered.length === tickets.length) {
        console.warn('Ticket not found for deletion:', id);
        return false;
      }

      await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  /**
   * Filter tickets
   */
  async filterTickets(options: FilterOptions): Promise<ServiceTicket[]> {
    try {
      let tickets = await this.getAllTickets();

      if (options.clientName) {
        tickets = tickets.filter(t =>
          t.clientName.toLowerCase().includes(options.clientName!.toLowerCase())
        );
      }

      if (options.productType) {
        tickets = tickets.filter(t => t.productType === options.productType);
      }

      if (options.status) {
        tickets = tickets.filter(t => t.status === options.status);
      }

      if (options.technicianName) {
        tickets = tickets.filter(t =>
          t.technicianName.toLowerCase().includes(options.technicianName!.toLowerCase())
        );
      }

      if (options.dateRangeStart && options.dateRangeEnd) {
        const start = new Date(options.dateRangeStart);
        const end = new Date(options.dateRangeEnd);
        tickets = tickets.filter(t => {
          const ticketDate = new Date(t.dateReceived);
          return ticketDate >= start && ticketDate <= end;
        });
      }

      return tickets;
    } catch (error) {
      console.error('Error filtering tickets:', error);
      return [];
    }
  },

  /**
   * Mark ticket as sent to Telegram
   */
  async markTelegramSent(id: string, messageId: string): Promise<boolean> {
    try {
      const updated = await this.updateTicket(id, {
        telegramSent: true,
        telegramMessageId: messageId,
      });
      return updated !== null;
    } catch (error) {
      console.error('Error marking ticket as sent:', error);
      return false;
    }
  },

  /**
   * Clear all tickets
   */
  async clearAllTickets(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TICKETS_KEY);
    } catch (error) {
      console.error('Error clearing tickets:', error);
      throw error;
    }
  },
};

/**
 * Settings Operations
 */
export const settingsStorage = {
  /**
   * Get all settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Return default settings
      return {
        technicianName: 'Technician',
        telegramConfig: {
          botToken: '',
          groupId: '',
        },
        theme: 'auto',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        technicianName: 'Technician',
        telegramConfig: {
          botToken: '',
          groupId: '',
        },
        theme: 'auto',
      };
    }
  },

  /**
   * Update settings
   */
  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = {
        ...current,
        ...data,
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Get Telegram config
   */
  async getTelegramConfig(): Promise<TelegramConfig> {
    try {
      const settings = await this.getSettings();
      return settings.telegramConfig;
    } catch (error) {
      console.error('Error getting Telegram config:', error);
      return {
        botToken: '',
        groupId: '',
      };
    }
  },

  /**
   * Update Telegram config
   */
  async updateTelegramConfig(config: TelegramConfig): Promise<TelegramConfig> {
    try {
      const settings = await this.getSettings();
      const updated = {
        ...settings,
        telegramConfig: config,
      };

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return config;
    } catch (error) {
      console.error('Error updating Telegram config:', error);
      throw error;
    }
  },

  /**
   * Get technician name
   */
  async getTechnicianName(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return settings.technicianName;
    } catch (error) {
      console.error('Error getting technician name:', error);
      return 'Technician';
    }
  },

  /**
   * Update technician name
   */
  async updateTechnicianName(name: string): Promise<string> {
    try {
      await this.updateSettings({ technicianName: name });
      return name;
    } catch (error) {
      console.error('Error updating technician name:', error);
      throw error;
    }
  },
};

/**
 * Data Export/Import
 */
export const dataStorage = {
  /**
   * Export all data as JSON
   */
  async exportAllData() {
    try {
      const tickets = await ticketStorage.getAllTickets();
      const settings = await settingsStorage.getSettings();

      return {
        tickets,
        settings,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TICKETS_KEY);
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};
