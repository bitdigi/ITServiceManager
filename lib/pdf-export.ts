/**
 * PDF Export Service
 * Generates and exports reports in PDF format using expo-print
 */

import { ServiceTicket, TicketStatus } from '@/types/ticket';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Format date to DD.MM.YYYY
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  } catch {
    return dateString;
  }
}

/**
 * Format currency to RON
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
  }).format(amount);
}

/**
 * Get status label in Romanian
 */
function getStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    pending: 'În așteptare',
    in_progress: 'În curs',
    completed: 'Finalizat',
    on_hold: 'Suspendat',
  };
  return labels[status];
}

/**
 * Generate HTML table rows for tickets
 */
function generateTicketRows(tickets: ServiceTicket[]): string {
  return tickets
    .map(
      (ticket) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${ticket.id.substring(0, 8)}</td>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${ticket.clientName}</td>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${ticket.productModel}</td>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${getStatusLabel(ticket.status)}</td>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${formatCurrency(ticket.cost || 0)}</td>
      <td style="padding: 8px; border: 1px solid #bfbfbf; font-size: 10px;">${ticket.technicianName || 'N/A'}</td>
    </tr>
  `
    )
    .join('');
}

/**
 * Base HTML template for reports
 */
function getHTMLTemplate(title: string, subtitle: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 8px;
            margin-bottom: 10px;
          }
          .summary {
            margin-bottom: 15px;
          }
          .summary-row {
            display: flex;
            margin-bottom: 8px;
          }
          .summary-label {
            font-weight: bold;
            width: 30%;
          }
          .summary-value {
            width: 70%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th {
            background-color: #e8e8e8;
            border: 1px solid #bfbfbf;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          td {
            border: 1px solid #bfbfbf;
            padding: 8px;
            font-size: 10px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 10px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>
        ${content}
        <div class="footer">
          Generat: ${new Date().toLocaleString('ro-RO')}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate Daily Report PDF
 */
export async function generateDailyReportPDF(
  tickets: ServiceTicket[],
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const totalTickets = tickets.length;
    const completedTickets = tickets.filter(t => t.status === 'completed').length;
    const totalRevenue = tickets
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    const content = `
      <div class="section">
        <div class="section-title">Rezumat</div>
        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Total Fișe:</span>
            <span class="summary-value">${totalTickets}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Finalizate:</span>
            <span class="summary-value">${completedTickets}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Venit Total:</span>
            <span class="summary-value">${formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detalii Fișe</div>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">ID</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Client</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Produs</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Status</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Cost</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Tehnician</th>
            </tr>
          </thead>
          <tbody>
            ${generateTicketRows(tickets)}
          </tbody>
        </table>
      </div>
    `;

    const html = getHTMLTemplate(
      'Raport Zilei',
      `Data: ${formatDate(date)}`,
      content
    );

    const fileName = `Raport_Zilei_${formatDate(date).replace(/\./g, '-')}`;

    if (Platform.OS === 'web') {
      // For web, we can't generate PDF directly
      return {
        success: false,
        error: 'PDF export nu este disponibil pe web. Folosiți dispozitivul Android.',
      };
    }

    // Generate PDF
    const pdf = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdf.uri);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la generare raport',
    };
  }
}

/**
 * Generate Technician Report PDF
 */
export async function generateTechnicianReportPDF(
  tickets: ServiceTicket[],
  technicianName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const technicianTickets = tickets.filter(t => t.technicianName === technicianName);
    const completedTickets = technicianTickets.filter(t => t.status === 'completed').length;
    const totalRevenue = technicianTickets
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    const content = `
      <div class="section">
        <div class="section-title">Rezumat</div>
        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Total Fișe:</span>
            <span class="summary-value">${technicianTickets.length}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Finalizate:</span>
            <span class="summary-value">${completedTickets}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Venit Generat:</span>
            <span class="summary-value">${formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Fișe Atribuite</div>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">ID</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Client</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Produs</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Status</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Cost</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Data</th>
            </tr>
          </thead>
          <tbody>
            ${generateTicketRows(technicianTickets)}
          </tbody>
        </table>
      </div>
    `;

    const html = getHTMLTemplate(
      'Raport Tehnician',
      `Tehnician: ${technicianName}`,
      content
    );

    const fileName = `Raport_Tehnician_${technicianName.replace(/\s/g, '_')}`;

    if (Platform.OS === 'web') {
      return {
        success: false,
        error: 'PDF export nu este disponibil pe web.',
      };
    }

    // Generate PDF
    const pdf = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdf.uri);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error generating technician report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la generare raport',
    };
  }
}

/**
 * Generate Product Type Report PDF
 */
export async function generateProductReportPDF(
  tickets: ServiceTicket[],
  productType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const productTickets = tickets.filter(t => t.productType === productType);
    const completedTickets = productTickets.filter(t => t.status === 'completed').length;
    const totalRevenue = productTickets
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    const content = `
      <div class="section">
        <div class="section-title">Rezumat</div>
        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Total Fișe:</span>
            <span class="summary-value">${productTickets.length}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Finalizate:</span>
            <span class="summary-value">${completedTickets}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Venit Total:</span>
            <span class="summary-value">${formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Fișe</div>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">ID</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Client</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Model</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Status</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Cost</th>
              <th style="padding: 8px; border: 1px solid #bfbfbf; background-color: #e8e8e8;">Tehnician</th>
            </tr>
          </thead>
          <tbody>
            ${generateTicketRows(productTickets)}
          </tbody>
        </table>
      </div>
    `;

    const html = getHTMLTemplate(
      'Raport Produs',
      `Tip Produs: ${productType}`,
      content
    );

    const fileName = `Raport_Produs_${productType}`;

    if (Platform.OS === 'web') {
      return {
        success: false,
        error: 'PDF export nu este disponibil pe web.',
      };
    }

    // Generate PDF
    const pdf = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdf.uri);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error generating product report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la generare raport',
    };
  }
}
