/**
 * Reports Service
 * Generates various reports from ticket data
 */

import {
  ServiceTicket,
  RevenueReport,
  TechnicianReport,
  ProductReport,
  ClientReport,
  ProductType,
  TicketStatus,
} from '@/types/ticket';
import { ticketStorage } from './storage';

/**
 * Generate revenue report
 */
export async function generateRevenueReport(
  startDate: string,
  endDate: string
): Promise<RevenueReport> {
  const tickets = await ticketStorage.filterTickets({
    dateRangeStart: startDate,
    dateRangeEnd: endDate,
  });

  const completedTickets = tickets.filter(t => t.status === 'completed');

  let totalRevenue = 0;
  let totalCost = 0;
  const productBreakdown: Record<ProductType, any> = {
    laptop: null,
    pc: null,
    phone: null,
    printer: null,
    gps: null,
    tv: null,
    box: null,
    tablet: null,
  };

  // Calculate totals and product breakdown
  completedTickets.forEach(ticket => {
    totalRevenue += ticket.cost;

    // Estimate cost as 30% of revenue (this is a simple estimate)
    totalCost += ticket.cost * 0.3;

    const productType = ticket.productType;
    if (!productBreakdown[productType]) {
      productBreakdown[productType] = {
        count: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };
    }

    productBreakdown[productType].count += 1;
    productBreakdown[productType].revenue += ticket.cost;
    productBreakdown[productType].cost += ticket.cost * 0.3;
    productBreakdown[productType].profit =
      productBreakdown[productType].revenue - productBreakdown[productType].cost;
  });

  // Filter out empty product types
  const byProductType: Record<string, any> = {};
  Object.entries(productBreakdown).forEach(([key, value]) => {
    if (value && value.count > 0) {
      byProductType[key] = value;
    }
  });

  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    ticketCount: completedTickets.length,
    averageTicketValue: completedTickets.length > 0 ? totalRevenue / completedTickets.length : 0,
    dateRange: {
      start: startDate,
      end: endDate,
    },
    byProductType,
  };
}

/**
 * Generate technician report
 */
export async function generateTechnicianReport(
  startDate: string,
  endDate: string
): Promise<TechnicianReport[]> {
  const tickets = await ticketStorage.filterTickets({
    dateRangeStart: startDate,
    dateRangeEnd: endDate,
  });

  // Group by technician
  const technicianMap: Record<string, ServiceTicket[]> = {};
  tickets.forEach(ticket => {
    if (!technicianMap[ticket.technicianName]) {
      technicianMap[ticket.technicianName] = [];
    }
    technicianMap[ticket.technicianName].push(ticket);
  });

  // Generate report for each technician
  const reports: TechnicianReport[] = Object.entries(technicianMap).map(
    ([technicianName, technicianTickets]) => {
      const completedCount = technicianTickets.filter(t => t.status === 'completed').length;
      const pendingCount = technicianTickets.filter(
        t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'on_hold'
      ).length;
      const totalRevenue = technicianTickets.reduce((sum, t) => sum + t.cost, 0);

      return {
        technicianName,
        ticketCount: technicianTickets.length,
        completedCount,
        pendingCount,
        completionRate: technicianTickets.length > 0 ? completedCount / technicianTickets.length : 0,
        totalRevenue,
        averageTicketValue: technicianTickets.length > 0 ? totalRevenue / technicianTickets.length : 0,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    }
  );

  return reports.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Generate product report
 */
export async function generateProductReport(
  startDate: string,
  endDate: string
): Promise<ProductReport[]> {
  const tickets = await ticketStorage.filterTickets({
    dateRangeStart: startDate,
    dateRangeEnd: endDate,
  });

  // Group by product type
  const productMap: Record<ProductType, ServiceTicket[]> = {
    laptop: [],
    pc: [],
    phone: [],
    printer: [],
    gps: [],
    tv: [],
    box: [],
    tablet: [],
  };

  tickets.forEach(ticket => {
    productMap[ticket.productType].push(ticket);
  });

  // Generate report for each product type
  const reports: ProductReport[] = Object.entries(productMap)
    .filter(([, tickets]) => tickets.length > 0)
    .map(([productType, productTickets]) => {
      const totalRevenue = productTickets.reduce((sum, t) => sum + t.cost, 0);
      const completedCount = productTickets.filter(t => t.status === 'completed').length;

      return {
        productType: productType as ProductType,
        repairCount: productTickets.length,
        failureRate: productTickets.length > 0 ? completedCount / productTickets.length : 0,
        averageCost: productTickets.length > 0 ? totalRevenue / productTickets.length : 0,
        totalRevenue,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    });

  return reports.sort((a, b) => b.repairCount - a.repairCount);
}

/**
 * Generate client report
 */
export async function generateClientReport(clientName: string): Promise<ClientReport | null> {
  const allTickets = await ticketStorage.getAllTickets();
  const clientTickets = allTickets.filter(
    t => t.clientName.toLowerCase() === clientName.toLowerCase()
  );

  if (clientTickets.length === 0) {
    return null;
  }

  const sortedByDate = [...clientTickets].sort(
    (a, b) => new Date(a.dateReceived).getTime() - new Date(b.dateReceived).getTime()
  );

  const firstServiceDate = sortedByDate[0].dateReceived;
  const lastServiceDate = sortedByDate[sortedByDate.length - 1].dateReceived;
  const totalSpent = clientTickets.reduce((sum, t) => sum + t.cost, 0);

  return {
    clientName: clientTickets[0].clientName,
    clientPhone: clientTickets[0].clientPhone,
    clientEmail: clientTickets[0].clientEmail,
    ticketCount: clientTickets.length,
    totalSpent,
    lastServiceDate,
    firstServiceDate,
    averageTicketValue: clientTickets.length > 0 ? totalSpent / clientTickets.length : 0,
    tickets: clientTickets,
  };
}

/**
 * Get all unique client names
 */
export async function getAllClientNames(): Promise<string[]> {
  const tickets = await ticketStorage.getAllTickets();
  const uniqueNames = Array.from(new Set(tickets.map(t => t.clientName)));
  return uniqueNames.sort();
}

/**
 * Get all unique technician names
 */
export async function getAllTechnicianNames(): Promise<string[]> {
  const tickets = await ticketStorage.getAllTickets();
  const uniqueNames = Array.from(new Set(tickets.map(t => t.technicianName)));
  return uniqueNames.sort();
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const tickets = await ticketStorage.getAllTickets();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTickets = tickets.filter(t => {
    const ticketDate = new Date(t.dateReceived);
    ticketDate.setHours(0, 0, 0, 0);
    return ticketDate.getTime() === today.getTime();
  });

  const completedTickets = tickets.filter(t => t.status === 'completed');
  const pendingTickets = tickets.filter(
    t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'on_hold'
  );

  const totalRevenue = completedTickets.reduce((sum, t) => sum + t.cost, 0);

  return {
    totalTickets: tickets.length,
    completedTickets: completedTickets.length,
    pendingTickets: pendingTickets.length,
    todayTickets: todayTickets.length,
    totalRevenue,
    averageTicketValue: tickets.length > 0 ? totalRevenue / tickets.length : 0,
  };
}
