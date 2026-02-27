# Build Instructions for ITServiceManager APK

## Prerequisites

You need to have the following installed on your local machine:

1. **Java 17 JDK** (required by Android Gradle plugin)
   - Download from: https://www.oracle.com/java/technologies/downloads/#java17
   - Or use: `brew install openjdk@17` (macOS) or `sudo apt install openjdk-17-jdk` (Linux)

2. **Node.js 22+** and npm/pnpm
   - Download from: https://nodejs.org/

3. **Android SDK** (optional if using Android Studio)
   - Or download from: https://developer.android.com/studio

## Build Steps

### 1. Clone/Download Project

```bash
cd ITServiceManager
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Java 17 Environment

**Linux/macOS:**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Linux
# or
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home  # macOS
# or
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS automatic
```

**Windows:**
```bash
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

### 4. Build APK

```bash
cd android
chmod +x gradlew  # Linux/macOS only
./gradlew assembleDebug  # Linux/macOS
# or
gradlew.bat assembleDebug  # Windows
```

### 5. APK Location

The built APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### "Android Gradle plugin requires Java 17"
- Make sure JAVA_HOME is set correctly
- Verify Java version: `java -version` should show 17.x.x

### "Could not download Gradle"
- Check internet connection
- Try: `./gradlew --refresh-dependencies assembleDebug`

### "AIDL compilation failed"
- Make sure all AIDL files are in: `android/app/src/main/aidl/woyou/aidlservice/`
- Check file permissions: `chmod 644 android/app/src/main/aidl/woyou/aidlservice/IWoyouService.aidl`

## Native Module Details

The app includes a custom React Native module for Sunmi T2S printer:

- **AIDL Interface:** `android/app/src/main/aidl/woyou/aidlservice/IWoyouService.aidl`
- **Java Manager:** `android/app/src/main/java/.../sunmi/SunmiPrinterManager.java`
- **React Module:** `android/app/src/main/java/.../sunmi/SunmiPrinterModule.java`
- **Gradle Dependency:** `com.sunmi:printerlibrary:1.0.18`

## Testing on Sunmi T2S

1. Install APK on device: `adb install android/app/build/outputs/apk/debug/app-debug.apk`
2. Create a service ticket in the app
3. Tap "Imprimă" button
4. QR code will print on label
5. Scan QR code with phone camera
6. Deep link opens ticket in app

## Release Build

For production release:
```bash
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

Requires signing configuration in `android/app/build.gradle`
