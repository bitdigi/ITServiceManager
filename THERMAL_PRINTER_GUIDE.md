# Ghid Imprimantă Termică Sunmi T2S

## Introducere

Aplicația IT Service Manager suportă imprimarea etichetelor pe imprimanta termică **Sunmi T2S** cu etichete de **62mm x 50mm**.

## Specificații Etichetă

| Proprietate | Valoare |
|------------|---------|
| Lățime | 62mm |
| Înălțime | 50mm |
| Format | Thermal label |
| Orientare | Portrait |
| Caractere per linie | ~32 (62mm printer) |

## Conținut Etichetă

Fiecare etichetă tipărită conține:

```
    FIȘĂ SERVICE
    ═════════════

ID: [Primele 8 caractere din ID]

TEL: [Numărul de telefon al clientului]

DATA: [Data primirii - format DD.MM.YYYY]

DEFECT:
[Primele 30 caractere din descrierea defectului]...

═════════════
```

## Utilizare

### 1. Conectare Imprimantă

1. **Activați Bluetooth** pe dispozitiv
2. **Conectați Sunmi T2S** la dispozitiv Android
3. **Deschideți aplicația** IT Service Manager

### 2. Imprimare Etichetă

1. **Deschideți o fișă de service** din lista Home
2. **Apăsați butonul "Imprimă"** în header-ul ecranului
3. Aplicația va detecta automat imprimanta conectată
4. Etichetă va fi tipărită pe Sunmi T2S

### 3. Imprimare Multiplă

Pentru a imprima mai multe etichete:

1. Deschideți fiecare fișă individual
2. Apăsați "Imprimă" pentru fiecare
3. Etichete vor fi tipărite secvențial

## Troubleshooting

### Imprimanta nu este detectată

**Verificări:**
- Sunmi T2S este conectată la Bluetooth
- Dispozitivul Android vede imprimanta în Settings → Bluetooth
- Aplicația are permisiuni Bluetooth (verificați Settings → Permissions)

### Etichetă nu se tipărește corect

**Verificări:**
- Etichete sunt introduse corect în imprimantă
- Etichete nu sunt prea mici sau prea mari (62mm x 50mm)
- Imprimanta are suficientă alimentare

### Caractere lipsă sau distorsionate

**Cauze posibile:**
- Etichete de calitate proastă
- Capul de imprimare al imprimantei este murdar
- Temperatura imprimantei nu este optimă

**Soluții:**
- Curățați capul de imprimare cu alcool izopropilic
- Ajustați temperatura în setările imprimantei
- Testați cu etichete de calitate mai bună

## Format Mesaj

Etichetele sunt formatate folosind comenzi **ESC/POS** standard:

| Comandă | Cod | Efect |
|---------|-----|-------|
| Align Center | ESC + a + 0x01 | Centrare text |
| Align Left | ESC + a + 0x00 | Aliniere stânga |
| Bold ON | ESC + E + 0x01 | Text bold |
| Bold OFF | ESC + E + 0x00 | Text normal |
| Line Feed | \n | Linie nouă |

## Configurare Avansată

### Schimbarea Dimensiunilor Etichetei

Pentru a folosi etichete de alte dimensiuni, editați `lib/thermal-printer.ts`:

```typescript
// Schimbați printerNbrCharactersPerLine
await RNThermalPrinter.printBluetooth({
  payload: labelText,
  printerNbrCharactersPerLine: 32, // 62mm
  // Pentru 80mm: 42
  // Pentru 58mm: 24
  ...device,
});
```

### Personalizare Format

Pentru a personaliza conținutul etichetei, editați funcția `generateLabelText()` în `lib/thermal-printer.ts`:

```typescript
function generateLabelText(ticket: ServiceTicket): string {
  // Adăugați câmpuri suplimentare
  const technicianName = ticket.technicianName;
  const cost = ticket.cost;
  // ... și includeți în label
}
```

## Permisiuni Necesare

Asigurați-vă că aplicația are următoarele permisiuni în `app.config.ts`:

```typescript
android: {
  permissions: [
    'android.permission.BLUETOOTH',
    'android.permission.BLUETOOTH_ADMIN',
    'android.permission.BLUETOOTH_CONNECT',
  ],
}
```

## Performanță

- **Timp de imprimare**: ~2-3 secunde per etichetă
- **Viteza**: Până la 20 etichete pe minut
- **Calitate**: 203 DPI (standard pentru imprimante termice)

## Limitări

1. **Doar Bluetooth**: Aplicația suportă doar conexiune Bluetooth (nu USB)
2. **O imprimantă**: Suportă o singură imprimantă conectată
3. **Text doar**: Etichete conțin doar text (fără imagini/coduri QR)
4. **Dimensiune fixă**: Format etichetă este optimizat pentru 62mm x 50mm

## Viitor

Planuri de îmbunătățire:
- Suport pentru multiple imprimante
- Adăugare coduri QR pe etichete
- Personalizare completă a formatului
- Imprimare batch din rapoarte

## Contact

Pentru probleme sau sugestii, consultați BUILD_APK.md și USER_GUIDE.md.

---

**Versiune**: 1.0.0  
**Data**: 09.01.2026  
**Limbă**: Română  
**Dispozitiv**: Sunmi T2S  
**Dimensiune Etichetă**: 62mm x 50mm
