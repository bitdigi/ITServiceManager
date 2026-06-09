import { Router, Request, Response } from 'express';
import { generateServiceTicketLabel, generateProductLabel } from '../../lib/label-pdf-generator';
import axios from 'axios';

const router = Router();

interface GenerateLabelRequest {
  ticketId: string;
  clientName: string;
  clientPhone: string;
  defect: string;
  date: string;
  telegramMessageId?: number;
  deepLinkUrl: string;
}

interface SendToTelegramRequest extends GenerateLabelRequest {
  telegramChatId: string;
}

/**
 * Generate service ticket label as PDF
 * POST /api/labels/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { ticketId, clientName, clientPhone, defect, date, telegramMessageId, deepLinkUrl } =
      req.body as GenerateLabelRequest;

    if (!ticketId || !clientName || !clientPhone || !defect || !date || !deepLinkUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pdfBuffer = await generateServiceTicketLabel(
      {
        ticketId,
        clientName,
        clientPhone,
        defect,
        date,
        telegramMessageId,
      },
      deepLinkUrl
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="label_${ticketId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating label:', error);
    res.status(500).json({ error: 'Failed to generate label' });
  }
});

/**
 * Generate and send label to Telegram
 * POST /api/labels/send-telegram
 */
router.post('/send-telegram', async (req: Request, res: Response) => {
  try {
    const {
      ticketId,
      clientName,
      clientPhone,
      defect,
      date,
      telegramMessageId,
      deepLinkUrl,
      telegramChatId,
    } = req.body as SendToTelegramRequest;

    if (!telegramChatId) {
      return res.status(400).json({ error: 'Missing telegramChatId' });
    }

    const pdfBuffer = await generateServiceTicketLabel(
      {
        ticketId,
        clientName,
        clientPhone,
        defect,
        date,
        telegramMessageId,
      },
      deepLinkUrl
    );

    // Send to Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
      return res.status(500).json({ error: 'Telegram bot token not configured' });
    }

    const formData = new FormData();
    formData.append('chat_id', telegramChatId);
    formData.append('document', new Blob([pdfBuffer], { type: 'application/pdf' }), `label_${ticketId}.pdf`);
    formData.append('caption', `🏷️ Etichetă Service\n\n📋 ID: ${ticketId}\n👤 Client: ${clientName}\n📱 Tel: ${clientPhone}`);

    const response = await axios.post(
      `https://api.telegram.org/bot${telegramToken}/sendDocument`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    res.json({
      success: true,
      message: 'Label sent to Telegram',
      telegramMessageId: response.data.result.message_id,
    });
  } catch (error) {
    console.error('Error sending label to Telegram:', error);
    res.status(500).json({ error: 'Failed to send label to Telegram' });
  }
});

/**
 * Generate product label as PDF
 * POST /api/labels/product
 */
router.post('/product', async (req: Request, res: Response) => {
  try {
    const { productName, barcode, price } = req.body;

    if (!productName || !barcode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pdfBuffer = await generateProductLabel(productName, barcode, price);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="product_${barcode}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating product label:', error);
    res.status(500).json({ error: 'Failed to generate product label' });
  }
});

export default router;
