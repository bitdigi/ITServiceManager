/**
 * Type declarations for react-native-sunmi-inner-printer
 */

declare module 'react-native-sunmi-inner-printer' {
  interface SunmiInnerPrinter {
    /**
     * Initialize printer
     */
    printerInit(): Promise<void>;

    /**
     * Print text
     */
    printText(text: string): Promise<void>;

    /**
     * Set font size
     * @param size Font size (default: 24)
     */
    setFontSize(size: number): Promise<void>;

    /**
     * Set alignment
     * @param alignment 0=left, 1=center, 2=right
     */
    setAlignment(alignment: 0 | 1 | 2): Promise<void>;

    /**
     * Line wrap (feed paper)
     * @param lines Number of lines to feed
     */
    lineWrap(lines: number): Promise<void>;

    /**
     * Print QR code
     * @param data QR code data
     * @param moduleSize Module size (default: 8)
     * @param errorLevel Error correction level (default: 3)
     */
    printQRCode(data: string, moduleSize?: number, errorLevel?: number): Promise<void>;

    /**
     * Print barcode
     * @param data Barcode data
     * @param barcodeType Barcode type
     * @param width Width
     * @param height Height
     * @param textPosition Text position (0=none, 1=above, 2=below, 3=both)
     */
    printBarCode(
      data: string,
      barcodeType: number,
      width: number,
      height: number,
      textPosition: 0 | 1 | 2 | 3
    ): Promise<void>;

    /**
     * Get printer status
     */
    getPrinterStatus(): Promise<number>;
  }

  const sunmiInnerPrinter: SunmiInnerPrinter;
  export default sunmiInnerPrinter;
}
