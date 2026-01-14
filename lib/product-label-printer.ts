/**
 * Product Label Printer Service
 * Uses expo-print for PDF generation and system print service
 * Label format: 62mm width x 30mm height
 */

import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export interface ProductLabel {
  productName: string;
  specifications?: string;
  price: number;
}

/**
 * Generate HTML for product label (62mm x 30mm)
 */
function generateLabelHTML(label: ProductLabel): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: 62mm 30mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 4mm;
          font-family: -apple-system, system-ui, sans-serif;
          width: 62mm;
          height: 30mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .product-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2mm;
          max-width: 54mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .specs {
          font-size: 10pt;
          margin-bottom: 2mm;
          max-width: 54mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .price {
          font-size: 16pt;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="product-name">${label.productName}</div>
      ${label.specifications ? `<div class="specs">${label.specifications}</div>` : ''}
      <div class="price">${label.price} RON</div>
    </body>
    </html>
  `;
}

/**
 * Print a single product label
 */
export async function printProductLabel(label: ProductLabel): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateLabelHTML(label);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      width: 62 * 2.83465, // 62mm to points
      height: 30 * 2.83465, // 30mm to points
    });

    // Print via system print service
    await Print.printAsync({ uri });

    return { success: true };
  } catch (error) {
    console.error('[ProductLabelPrinter] Error printing label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Print multiple identical labels
 */
export async function printMultipleLabels(
  label: ProductLabel,
  count: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateLabelHTML(label);
    
    // Generate multiple labels in one PDF
    const multipleLabelsHTML = Array(count).fill(html).join('<div style="page-break-after: always;"></div>');
    
    const { uri } = await Print.printToFileAsync({
      html: multipleLabelsHTML,
      width: 62 * 2.83465,
      height: 30 * 2.83465,
    });

    await Print.printAsync({ uri });

    return { success: true };
  } catch (error) {
    console.error('[ProductLabelPrinter] Error printing multiple labels:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Preview label before printing
 */
export async function previewLabel(label: ProductLabel): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const html = generateLabelHTML(label);
    
    const { uri } = await Print.printToFileAsync({
      html,
      width: 62 * 2.83465,
      height: 30 * 2.83465,
    });

    // Share/preview the PDF
    await shareAsync(uri);

    return { success: true, uri };
  } catch (error) {
    console.error('[ProductLabelPrinter] Error previewing label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test printer connection
 */
export async function testPrinter(): Promise<{ success: boolean; error?: string }> {
  try {
    const testLabel: ProductLabel = {
      productName: 'Test Product',
      specifications: 'Test Specs',
      price: 100,
    };

    return await printProductLabel(testLabel);
  } catch (error) {
    console.error('[ProductLabelPrinter] Error testing printer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
