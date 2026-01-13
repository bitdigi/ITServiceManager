/**
 * Product Label Printer Service
 * Uses Android Print Service (expo-print) instead of proprietary Sunmi API
 * Label format: 62mm width x 30mm height
 */

import * as Print from 'expo-print';

export interface ProductLabel {
  productName: string;
  specifications?: string;
  price: number;
}

/**
 * Generate HTML for product label (62mm x 30mm)
 * Optimized for thermal printer
 */
function generateProductLabelHTML(label: ProductLabel): string {
  const { productName, specifications, price } = label;

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
      padding: 2mm;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      line-height: 1.2;
      width: 62mm;
      height: 30mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    
    .product-name {
      font-size: 11pt;
      margin-bottom: 1mm;
      font-weight: normal;
    }
    
    .specifications {
      font-size: 9pt;
      margin-bottom: 1mm;
    }
    
    .price {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 1mm;
    }
  </style>
</head>
<body>
  <div class="product-name">${productName}</div>
  ${specifications ? `<div class="specifications">${specifications}</div>` : ''}
  <div class="price">PRET ${price.toFixed(0)} RON</div>
</body>
</html>
  `;
}

/**
 * Print product label using Android Print Service
 */
export async function printProductLabel(label: ProductLabel): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const html = generateProductLabelHTML(label);
    
    await Print.printAsync({
      html,
      width: 62 * 3.78, // 62mm to pixels (1mm ≈ 3.78px at 96 DPI)
      height: 30 * 3.78, // 30mm to pixels
    });

    return { success: true };
  } catch (error) {
    console.error('Error printing product label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
    };
  }
}

/**
 * Print multiple product labels
 */
export async function printMultipleProductLabels(labels: ProductLabel[]): Promise<{
  success: boolean;
  printed: number;
  error?: string;
}> {
  try {
    let printedCount = 0;

    for (const label of labels) {
      try {
        const result = await printProductLabel(label);
        if (result.success) {
          printedCount++;
        }
      } catch (e) {
        console.error('Error printing label:', e);
      }
    }

    return {
      success: printedCount === labels.length,
      printed: printedCount,
      error: printedCount < labels.length ? 'Unele etichete nu au putut fi tipărite' : undefined,
    };
  } catch (error) {
    console.error('Error printing multiple labels:', error);
    return {
      success: false,
      printed: 0,
      error: error instanceof Error ? error.message : 'Eroare la imprimare',
    };
  }
}
