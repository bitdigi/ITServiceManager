/**
 * Product Label Printer Service
 * For Sunmi T2S AIO with integrated printer
 * Label format: 62mm width x 30mm height
 */

import { NativeModules } from 'react-native';

// Access Sunmi PrinterService through NativeModules
const SunmiPrinter = NativeModules.SunmiPrinter || NativeModules.SunmiPrinterModule;

export interface ProductLabel {
  productName: string;
  specifications?: string;
  price: number;
}

/**
 * Generate product label text for Sunmi printer (ESC/POS format)
 * Format optimized for 62mm x 30mm label
 * 
 * Label Layout (similar to example):
 * ┌──────────────────────────┐
 * │ Incarcator Lenovo Think  │
 * │ 3.25A/20V 65W Usb-C      │
 * │ PRET 140 RON             │
 * └──────────────────────────┘
 */
function generateProductLabelText(label: ProductLabel): string {
  const { productName, specifications, price } = label;

  // ESC/POS commands for thermal printer
  const ESC = '\x1B';
  const GS = '\x1D';
  
  // Alignment
  const ALIGN_CENTER = ESC + 'a' + '\x01';
  const ALIGN_LEFT = ESC + 'a' + '\x00';
  
  // Text formatting
  const BOLD_ON = ESC + 'E' + '\x01';
  const BOLD_OFF = ESC + 'E' + '\x00';
  const NORMAL_SIZE = GS + '!' + '\x00';
  const DOUBLE_HEIGHT = GS + '!' + '\x01';
  
  const FEED_LINE = '\n';

  // Build label with optimized layout for 30mm height
  let labelText = '';
  
  // Center align all content
  labelText += ALIGN_CENTER;
  labelText += NORMAL_SIZE;
  labelText += FEED_LINE;
  
  // Product name - normal size
  labelText += productName;
  labelText += FEED_LINE;
  
  // Specifications - if provided
  if (specifications && specifications.trim()) {
    labelText += specifications;
    labelText += FEED_LINE;
  }
  
  // Price - bold, slightly larger
  labelText += BOLD_ON;
  labelText += `PRET ${price.toFixed(0)} RON`;
  labelText += BOLD_OFF;
  labelText += FEED_LINE;
  labelText += FEED_LINE;

  return labelText;
}

/**
 * Print product label on Sunmi T2S integrated printer
 */
export async function printProductLabel(label: ProductLabel): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!SunmiPrinter) {
      return {
        success: false,
        error: 'Sunmi PrinterService nu este disponibil pe acest dispozitiv',
      };
    }

    // Generate label text
    const labelText = generateProductLabelText(label);

    // Initialize printer
    if (SunmiPrinter.initPrinter) {
      await SunmiPrinter.initPrinter();
    }

    // Print text
    if (SunmiPrinter.printText) {
      await SunmiPrinter.printText(labelText);
    } else if (SunmiPrinter.print) {
      // Alternative method name
      await SunmiPrinter.print(labelText);
    }

    // Feed paper
    if (SunmiPrinter.feedPaper) {
      await SunmiPrinter.feedPaper();
    } else if (SunmiPrinter.lineWrap) {
      await SunmiPrinter.lineWrap(2);
    }

    return {
      success: true,
    };
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
    if (!SunmiPrinter) {
      return {
        success: false,
        printed: 0,
        error: 'Sunmi PrinterService nu este disponibil',
      };
    }

    // Initialize printer
    if (SunmiPrinter.initPrinter) {
      await SunmiPrinter.initPrinter();
    }

    let printedCount = 0;

    for (const label of labels) {
      try {
        const labelText = generateProductLabelText(label);

        // Print text
        if (SunmiPrinter.printText) {
          await SunmiPrinter.printText(labelText);
        } else if (SunmiPrinter.print) {
          await SunmiPrinter.print(labelText);
        }

        printedCount++;
      } catch (e) {
        console.error('Error printing label:', e);
      }
    }

    // Feed paper after all prints
    if (SunmiPrinter.feedPaper) {
      await SunmiPrinter.feedPaper();
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
