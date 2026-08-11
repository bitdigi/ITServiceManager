import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

const LABEL_WIDTH_MM = 62;
const LABEL_HEIGHT_MM = 50;
const MM_TO_POINTS = 2.834645669;
const LABEL_WIDTH = LABEL_WIDTH_MM * MM_TO_POINTS;
const LABEL_HEIGHT = LABEL_HEIGHT_MM * MM_TO_POINTS;

interface ServiceTicketLabel {
  ticketId: string;
  clientName: string;
  clientPhone: string;
  defect: string;
  date: string;
  telegramMessageId?: number;
}

async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    width: 150,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

function toNodeBuffer(bytes: Uint8Array): Buffer {
  // `Uint8Array.from` guarantees an ArrayBuffer-backed view for Node 22.
  return Buffer.from(Uint8Array.from(bytes));
}

export async function generateServiceTicketLabel(
  ticket: ServiceTicketLabel,
  deepLinkUrl: string,
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([LABEL_WIDTH, LABEL_HEIGHT]);
    const { width, height } = page.getSize();
    const margin = 4;
    const qrImage = await pdfDoc.embedPng(await generateQRCode(deepLinkUrl));

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let yPosition = height - margin - 8;
    page.drawText(`ID: ${ticket.ticketId}`, {
      x: margin + 2,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    yPosition -= 10;

    for (const [prefix, text, size] of [
      ['Client: ', ticket.clientName, 7],
      ['Tel: ', ticket.clientPhone, 7],
      ['Data: ', ticket.date, 7],
    ] as const) {
      page.drawText(`${prefix}${text}`, { x: margin + 2, y: yPosition, size, color: rgb(0, 0, 0) });
      yPosition -= 8;
    }

    for (const line of wrapText(ticket.defect, 45)) {
      page.drawText(line, { x: margin + 2, y: yPosition, size: 6, color: rgb(0, 0, 0) });
      yPosition -= 6;
    }

    const qrSize = 18 * MM_TO_POINTS;
    page.drawImage(qrImage, {
      x: (width - qrSize) / 2,
      y: margin + 2,
      width: qrSize,
      height: qrSize,
    });

    if (ticket.telegramMessageId) {
      page.drawText(`Msg: ${ticket.telegramMessageId}`, {
        x: margin + 2,
        y: margin + 2,
        size: 6,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    return toNodeBuffer(await pdfDoc.save());
  } catch (error) {
    console.error('Error generating label PDF:', error);
    throw error;
  }
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += currentLine ? ` ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

export async function generateProductLabel(productName: string, barcode: string, price?: string): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([LABEL_WIDTH, LABEL_HEIGHT * 0.6]);
    const { width, height } = page.getSize();
    const margin = 3;

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let yPosition = height - margin - 6;
    page.drawText(productName, {
      x: margin + 2,
      y: yPosition,
      size: 8,
      color: rgb(0, 0, 0),
      font: await pdfDoc.embedFont('Helvetica-Bold'),
    });
    yPosition -= 8;
    page.drawText(barcode, {
      x: margin + 2,
      y: yPosition,
      size: 7,
      color: rgb(0, 0, 0),
      font: await pdfDoc.embedFont('Courier'),
    });
    if (price) {
      page.drawText(`Preț: ${price}`, { x: margin + 2, y: yPosition - 8, size: 6, color: rgb(0, 0, 0) });
    }

    return toNodeBuffer(await pdfDoc.save());
  } catch (error) {
    console.error('Error generating product label:', error);
    throw error;
  }
}
