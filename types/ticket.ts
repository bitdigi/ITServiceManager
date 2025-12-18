/**
 * Service Ticket Data Types
 * Defines all TypeScript interfaces for the IT Service Manager application
 */

export type ProductType = 
  | 'laptop'
  | 'pc'
  | 'phone'
  | 'printer'
  | 'gps'
  | 'tv'
  | 'box'
  | 'tablet';

export type TicketStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'on_hold';

export interface ServiceTicket {
  id: string; // UUID
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  productType: ProductType;
  productModel: string;
  productSerialNumber: string;
  problemDescription: string;
  diagnostic: string;
  solutionApplied: string;
  cost: number;
  status: TicketStatus;
  technicianName: string;
  dateReceived: string; // ISO date string
  dateDelivered: string | null; // ISO date string or null
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  telegramSent: boolean;
  telegramMessageId: string | null;
}

export interface TelegramConfig {
  botToken: string;
  groupId: string;
}

export interface AppSettings {
  technicianName: string;
  telegramConfig: TelegramConfig;
  theme: 'light' | 'dark' | 'auto';
}

export interface RevenueReport {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  ticketCount: number;
  averageTicketValue: number;
  dateRange: {
    start: string;
    end: string;
  };
  byProductType: {
    [key in ProductType]?: {
      count: number;
      revenue: number;
      cost: number;
      profit: number;
    };
  };
}

export interface TechnicianReport {
  technicianName: string;
  ticketCount: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number;
  totalRevenue: number;
  averageTicketValue: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ProductReport {
  productType: ProductType;
  repairCount: number;
  failureRate: number;
  averageCost: number;
  totalRevenue: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ClientReport {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  ticketCount: number;
  totalSpent: number;
  lastServiceDate: string;
  firstServiceDate: string;
  averageTicketValue: number;
  tickets: ServiceTicket[];
}

export interface FilterOptions {
  clientName?: string;
  productType?: ProductType;
  status?: TicketStatus;
  technicianName?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}
