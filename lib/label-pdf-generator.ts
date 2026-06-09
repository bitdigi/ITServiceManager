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
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function generateServiceTicketLabel(
  ticket: ServiceTicketLabel,
  deepLinkUrl: string
): Promise<Buffer> {
  try {
    const pdfDoc = PDFDocument.create();
    const page = pdfDoc.addPage([LABEL_WIDTH, LABEL_HEIGHT]);

    const { width, height } = page.getSize();
    const margin = 4;

    const qrCodeDataUrl = await generateQRCode(deepLinkUrl);
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

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

    page.drawText(`Client: ${ticket.clientName}`, {
      x: margin + 2,
      y: yPosition,
      size: 7,
      color: rgb(0, 0, 0),
    });
    yPosition -= 8;

    page.drawText(`Tel: ${ticket.clientPhone}`, {
      x: margin + 2,
      y: yPosition,
      size: 7,
      color: rgb(0, 0, 0),
    });
    yPosition -= 8;

    page.drawText(`Data: ${ticket.date}`, {
      x: margin + 2,
      y: yPosition,
      size: 7,
      color: rgb(0, 0, 0),
    });
    yPosition -= 8;

    const defectLines = wrapText(ticket.defect, 45);
    for (const line of defectLines) {
      page.drawText(line, {
        x: margin + 2,
        y: yPosition,
        size: 6,
        color: rgb(0, 0, 0),
      });
      yPosition -= 6;
    }

    const qrSize = 18 * MM_TO_POINTS;
    const qrX = (width - qrSize) / 2;
    const qrY = margin + 2;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
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

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
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
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

export async function generateProductLabel(
  productName: string,
  barcode: string,
  price?: string
): Promise<Buffer> {
  try {
    const pdfDoc = PDFDocument.create();
    const page = pdfDoc.addPage([LABEL_WIDTH, LABEL_HEIGHT * 0.6]);

    const { width, height } = page.getSize();
    const margin = 3;

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

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
    yPosition -= 8;

    if (price) {
      page.drawText(`Price: ${price}`, {
        x: margin + 2,
        y: yPosition,
        size: 6,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating product label:', error);
    throw error;
  }
}
