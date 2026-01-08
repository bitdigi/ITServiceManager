# Instrucțiuni pentru Generarea APK-ului Android

Aceasta este aplicația **IT Service Manager** - o aplicație mobilă pentru gestionarea fișelor de service IT cu integrare Telegram.

## Opțiunea 1: Construire cu EAS (Recomandată)

### Cerințe:
- Cont Expo (gratuit la https://expo.dev)
- EAS CLI instalat: `npm install -g eas-cli`

### Pași:

1. **Login în Expo:**
   ```bash
   eas login
   ```

2. **Configurare build (prima dată):**
   ```bash
   eas build --platform android --local
   ```

3. **Construire APK:**
   ```bash
   eas build --platform android --local
   ```

4. APK-ul va fi generat și salvat în directorul curent.

## Opțiunea 2: Construire Locală cu Android Studio

### Cerințe:
- Android SDK instalat
- Android Studio (opțional, dar recomandat)
- Java Development Kit (JDK) 11+

### Pași:

1. **Instalare dependențe:**
   ```bash
   npm install
   ```

2. **Construire APK:**
   ```bash
   expo prebuild --clean
   cd android
   ./gradlew assembleRelease
   ```

3. APK-ul va fi în: `android/app/build/outputs/apk/release/app-release.apk`

## Opțiunea 3: Construire cu Expo Go (Pentru Testare)

Pentru testare rapidă pe dispozitiv Android:

1. **Instalați Expo Go** din Google Play Store
2. **Rulați dev server:**
   ```bash
   npm run dev
   ```
3. **Scanați QR code** cu Expo Go

## Configurare Aplicație

Înainte de build, asigurați-vă că ați configurat:

1. **App Name și Logo** în `app.config.ts`:
   - `appName`: Numele aplicației
   - `logoUrl`: URL-ul logo-ului (opțional)

2. **Telegram Integration** (în Settings):
   - Bot Token (obținut de la @BotFather pe Telegram)
   - Group ID (ID-ul grupului Telegram)

## Testare Aplicației

După instalarea APK-ului pe dispozitiv:

1. **Deschideți Settings** și configurați:
   - Telegram Bot Token
   - Telegram Group ID
   - Numele dumneavoastră (Tehnician)

2. **Testați fluxurile principale:**
   - Creați o nouă fișă de service
   - Editați fișa
   - Ștergeți fișa
   - Sincronizați cu Telegram
   - Vizualizați rapoarte

## Distribuire

Pentru a distribui APK-ul:

1. **Opțiunea 1**: Trimiteți APK-ul direct utilizatorilor
2. **Opțiunea 2**: Publicați pe Google Play Store (necesită cont developer)
3. **Opțiunea 3**: Folosiți Firebase App Distribution

## Suport

Pentru probleme sau întrebări:
- Consultați documentația Expo: https://docs.expo.dev
- Consultați documentația React Native: https://reactnative.dev
- Consultați documentația Android: https://developer.android.com

---

**Versiune Aplicație**: 1.0.0  
**Data Creării**: 08.01.2026  
**Limbă**: Română  
**Platforma**: Android (APK)
