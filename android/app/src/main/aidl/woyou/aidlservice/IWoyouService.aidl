package woyou.aidlservice;

interface IWoyouService {
    void printerInit();
    int getPrinterStatus();
    void setPrinterMode(int mode);
    void printText(String text);
    void printBitmap(in Bitmap bitmap);
    void setFontSize(int size);
    void setAlignment(int alignment);
    void lineWrap(int lines);
    void printQRCode(String data, int moduleSize, int errorLevel);
    void labelLocate();
    void labelOutput();
    String getFirmwareVersion();
}
