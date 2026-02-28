package space.manus.ITServiceManager.t20251218163530.sunmi;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
public class SunmiPrinterModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SunmiPrinterModule";
    private SunmiPrinterManager printerManager;
    public SunmiPrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        printerManager = new SunmiPrinterManager(reactContext);
    }
    @Override
    public String getName() {
        return "SunmiPrinter";
    }
    @ReactMethod
    public void connect(Promise promise) {
        try {
            printerManager.connect();
            promise.resolve("Connecting to printer...");
        } catch (Exception e) {
            promise.reject("CONNECT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void disconnect(Promise promise) {
        try {
            printerManager.disconnect();
            promise.resolve("Disconnected");
        } catch (Exception e) {
            promise.reject("DISCONNECT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void isConnected(Promise promise) {
        try {
            promise.resolve(printerManager.isConnected());
        } catch (Exception e) {
            promise.reject("CHECK_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void printerInit(Promise promise) {
        try {
            printerManager.printerInit();
            promise.resolve("Printer initialized");
        } catch (Exception e) {
            promise.reject("INIT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void getPrinterStatus(Promise promise) {
        try {
            int status = printerManager.getPrinterStatus();
            WritableMap result = Arguments.createMap();
            result.putInt("status", status);
            result.putString("message", status == 0 ? "Normal" : (status == 1 ? "Offline" : "Error"));
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void setPrinterMode(int mode, Promise promise) {
        try {
            printerManager.setPrinterMode(mode);
            promise.resolve("Mode set");
        } catch (Exception e) {
            promise.reject("MODE_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void printText(String text, Promise promise) {
        try {
            printerManager.printText(text);
            promise.resolve("Text printed");
        } catch (Exception e) {
            promise.reject("PRINT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void printBitmap(String base64Image, Promise promise) {
        try {
            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            if (bitmap != null) {
                printerManager.printBitmap(bitmap);
                promise.resolve("Bitmap printed");
            } else {
                promise.reject("BITMAP_ERROR", "Failed to decode");
            }
        } catch (Exception e) {
            promise.reject("BITMAP_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void setFontSize(int size, Promise promise) {
        try {
            printerManager.setFontSize(size);
            promise.resolve("Font size set");
        } catch (Exception e) {
            promise.reject("FONT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void setAlignment(int alignment, Promise promise) {
        try {
            printerManager.setAlignment(alignment);
            promise.resolve("Alignment set");
        } catch (Exception e) {
            promise.reject("ALIGNMENT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void lineWrap(int lines, Promise promise) {
        try {
            printerManager.lineWrap(lines);
            promise.resolve("Line wrap");
        } catch (Exception e) {
            promise.reject("WRAP_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void printQRCode(String data, int moduleSize, int errorLevel, Promise promise) {
        try {
            printerManager.printQRCode(data, moduleSize, errorLevel);
            promise.resolve("QR code printed");
        } catch (Exception e) {
            promise.reject("QR_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void labelLocate(Promise promise) {
        try {
            printerManager.labelLocate();
            promise.resolve("Label located");
        } catch (Exception e) {
            promise.reject("LOCATE_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void labelOutput(Promise promise) {
        try {
            printerManager.labelOutput();
            promise.resolve("Label output");
        } catch (Exception e) {
            promise.reject("OUTPUT_ERROR", e.getMessage());
        }
    }
    @ReactMethod
    public void getFirmwareVersion(Promise promise) {
        try {
            String version = printerManager.getFirmwareVersion();
            promise.resolve(version);
        } catch (Exception e) {
            promise.reject("VERSION_ERROR", e.getMessage());
        }
    }
}
