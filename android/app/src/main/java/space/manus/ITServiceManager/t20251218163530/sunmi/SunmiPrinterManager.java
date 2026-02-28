package space.manus.ITServiceManager.t20251218163530.sunmi;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;
import woyou.aidlservice.IWoyouService;
public class SunmiPrinterManager {
    private static final String TAG = "SunmiPrinterManager";
    private Context context;
    private IWoyouService printerService;
    private boolean isConnected = false;
    private PrinterConnectionListener connectionListener;
    public interface PrinterConnectionListener {
        void onConnected();
        void onDisconnected();
        void onError(String error);
    }
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.d(TAG, "Printer service connected");
            printerService = IWoyouService.Stub.asInterface(service);
            isConnected = true;
            if (connectionListener != null) {
                connectionListener.onConnected();
            }
        }
        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.d(TAG, "Printer service disconnected");
            printerService = null;
            isConnected = false;
            if (connectionListener != null) {
                connectionListener.onDisconnected();
            }
        }
    };
    public SunmiPrinterManager(Context context) {
        this.context = context;
    }
    public void setConnectionListener(PrinterConnectionListener listener) {
        this.connectionListener = listener;
    }
    public void connect() {
        try {
            Intent intent = new Intent("woyou.aidlservice.ISunmiPrinterService");
            intent.setPackage("woyou.aidlservice");
            context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
            Log.d(TAG, "Attempting to connect to Sunmi printer service");
        } catch (Exception e) {
            Log.e(TAG, "Error connecting: " + e.getMessage());
            if (connectionListener != null) {
                connectionListener.onError("Failed to connect: " + e.getMessage());
            }
        }
    }
    public void disconnect() {
        try {
            if (printerService != null) {
                context.unbindService(serviceConnection);
                printerService = null;
                isConnected = false;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error disconnecting: " + e.getMessage());
        }
    }
    public boolean isConnected() {
        return isConnected && printerService != null;
    }
    public void printerInit() throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.printerInit();
    }
    public int getPrinterStatus() throws RemoteException {
        if (!isConnected()) return 1;
        return printerService.getPrinterStatus();
    }
    public void setPrinterMode(int mode) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.setPrinterMode(mode);
    }
    public void printText(String text) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.printText(text);
    }
    public void printBitmap(Bitmap bitmap) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.printBitmap(bitmap);
    }
    public void setFontSize(int size) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.setFontSize(size);
    }
    public void setAlignment(int alignment) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.setAlignment(alignment);
    }
    public void lineWrap(int lines) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.lineWrap(lines);
    }
    public void printQRCode(String data, int moduleSize, int errorLevel) throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.printQRCode(data, moduleSize, errorLevel);
    }
    public void labelLocate() throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.labelLocate();
    }
    public void labelOutput() throws RemoteException {
        if (!isConnected()) throw new RemoteException("Printer not connected");
        printerService.labelOutput();
    }
    public String getFirmwareVersion() throws RemoteException {
        if (!isConnected()) return "Unknown";
        return printerService.getFirmwareVersion();
    }
}
