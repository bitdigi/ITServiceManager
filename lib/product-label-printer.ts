/**
 * Product Label Printer Service
 * Uses react-native-sunmi-inner-printer for SunmiPrinterService
 * Label format: 62mm width x 30mm height
 */

import SunmiInnerPrinter from 'react-native-sunmi-inner-printer';

export interface ProductLabel {
  productName: string;
  specifications?: string;
  price: number;
}

/**
 * Initialize Sunmi printer
 */
async function initPrinter(): Promise<void> {
  try {
    await SunmiInnerPrinter.printerInit();
  } catch (error) {
    console.error('Error initializing printer:', error);
    throw error;
  }
}

/**
 * Print product label using Sunmi printer
 */
export async function printProductLabel(label: ProductLabel): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { productName, specifications, price } = label;

    // Initialize printer
    await initPrinter();

    // Set alignment to center
    await SunmiInnerPrinter.setAlignment(1); // 0=left, 1=center, 2=right

    // Set normal font size
    await SunmiInnerPrinter.setFontSize(24);

    // Print product name
    await SunmiInnerPrinter.printText('\n');
    await SunmiInnerPrinter.printText(`${productName}\n`);

    // Print specifications if provided
    if (specifications && specifications.trim()) {
      await SunmiInnerPrinter.setFontSize(20);
      await SunmiInnerPrinter.printText(`${specifications}\n`);
    }

    // Print price - bold and larger
    await SunmiInnerPrinter.setFontSize(28);
    await SunmiInnerPrinter.printText(`PRET ${price.toFixed(0)} RON\n`);

    // Feed paper
    await SunmiInnerPrinter.printText('\n');
    await SunmiInnerPrinter.lineWrap(2);

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
