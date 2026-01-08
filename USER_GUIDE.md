# Ghid Utilizator - IT Service Manager

## Introducere

**IT Service Manager** este o aplicație mobilă pentru gestionarea fișelor de service IT. Aplicația permite:
- Crearea și gestionarea fișelor de service
- Sincronizarea automată cu Telegram
- Generarea rapoartelor de venituri și performanță
- Gestionarea informațiilor despre clienți și produse

## Instalare

1. **Descărcați APK-ul** de pe dispozitivul dumneavoastră
2. **Deschideți APK-ul** și urmați instrucțiunile de instalare
3. **Permisiuni**: Acordați permisiunile necesare pentru stocare și rețea

## Configurare Inițială

### 1. Setări Telegram

Pentru a sincroniza fișele cu Telegram:

1. Deschideți **Setări** (tab-ul cu roată dințată)
2. Completați:
   - **Bot Token**: Token-ul bot-ului Telegram
   - **Group ID**: ID-ul grupului Telegram

#### Cum să obțineți Token și Group ID:

**Pasul 1: Creați un bot Telegram**
- Deschideți Telegram și căutați **@BotFather**
- Trimiteți `/start`
- Trimiteți `/newbot` și urmați instrucțiunile
- Copiați token-ul bot-ului

**Pasul 2: Obțineți Group ID**
- Creați un grup Telegram
- Adăugați bot-ul în grup
- Trimiteți un mesaj în grup
- Vizitați: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
- Căutați `"chat":{"id":<GROUP_ID>}` și copiați ID-ul

### 2. Informații Tehnician

1. Deschideți **Setări**
2. Introduceți **Numele Dumneavoastră** (va apărea pe fiecare fișă)
3. Apăsați **Salvează Nume Tehnician**

## Utilizare Aplicației

### Ecranul Home

Afișează:
- **Statistici**: Total fișe, finalizate, în curs
- **Search Bar**: Căutare după client, model, telefon
- **Buton Sincronizare**: Preluare fișe din Telegram
- **Buton +**: Adăugare nouă fișă

### Crearea unei Noi Fișe

1. Apăsați butonul **+** (colț dreapta jos)
2. Completați secțiunile:

#### Informații Client
- **Nume Client** (obligatoriu)
- **Număr Telefon** (obligatoriu)
- **Email** (opțional)

#### Informații Produs
- **Tip Produs** (obligatoriu): Laptop, PC, Telefon, Imprimantă, GPS, TV, Box, Tabletă
- **Model Produs** (obligatoriu)
- **Număr Serie** (opțional)

#### Detalii Service
- **Descrierea Problemei** (obligatoriu)
- **Diagnostic** (obligatoriu)
- **Soluție Aplicată** (obligatoriu)

#### Cost și Status
- **Cost** (obligatoriu): Suma în RON
- **Status**: În așteptare, În curs, Finalizat, Suspendat
- **Data Primirii**: Selectabil din calendar

3. Apăsați **Salvează Fișă**

### Vizualizarea Fișei

1. Apăsați pe o fișă din lista Home
2. Vizualizați detaliile complete
3. Opțiuni:
   - **Editare**: Modificare informații
   - **Ștergere**: Ștergere fișă (și din Telegram)

### Editarea Fișei

1. Deschideți fișa
2. Apăsați **Editare**
3. Modificați informațiile dorite
4. Apăsați **Salvează Fișă**

### Ștergerea Fișei

1. Deschideți fișa
2. Apăsați **Ștergere**
3. Confirmați ștergerea
4. Fișa va fi ștearsă și din Telegram

## Rapoarte

Accesați tab-ul **Rapoarte** pentru a vedea:

### Raport Venituri
- Venituri totale
- Cost total
- Profit
- Număr de fișe
- Valoare medie per fișă

### Raport Tehnician
- Fișe per tehnician
- Fișe finalizate
- Fișe în curs
- Fișe în așteptare

### Raport Produse
- Produse cel mai des reparate
- Fișe per produs
- Cost mediu per produs

## Sincronizare Telegram

### Trimitere Automată
- Fiecare fișă nouă este trimisă automat pe Telegram
- Mesajul conține toate detaliile fișei
- Status: ✓ Trimis pe Telegram

### Sincronizare Manuală
1. Apăsați butonul **Sincronizare** pe Home
2. Aplicația va prelua fișele din Telegram
3. Fișele noi vor fi adăugate în aplicație

### Format Mesaj Telegram

Mesajele sunt formatate ca:
```
📋 FIȘĂ DE SERVICE
━━━━━━━━━━━━━━━━━
👤 Client: [Nume]
📱 Telefon: [Telefon]
🖥️ Produs: [Tip] - [Model]
🔧 Problemă: [Descriere]
💡 Diagnostic: [Diagnostic]
✅ Soluție: [Soluție]
💰 Cost: [Cost] RON
📊 Status: [Status]
👨‍🔧 Tehnician: [Nume]
📅 Data: [Data]
```

## Setări

### Dark Mode
- Apăsați toggle-ul pentru a activa/dezactiva dark mode
- Aplicația va folosi culori optimizate pentru ochi

### Export Data
- Apăsați **Export Data** pentru a descărca o copie a tuturor fișelor
- Fișierul va fi salvat în format JSON

### Clear All Data
- Apăsați **Clear All Data** pentru a șterge toate fișele
- ⚠️ Această acțiune nu poate fi anulată!

## Sfaturi și Trucuri

1. **Căutare rapidă**: Folosiți search bar pentru a găsi fișe după client, model sau telefon
2. **Filtrare status**: Fișele sunt sortate după data creării (cea mai nouă în față)
3. **Backup**: Exportați datele regulat pentru a evita pierderea informațiilor
4. **Telegram**: Asigurați-vă că bot-ul are permisiuni de scriere în grup

## Rezolvare Probleme

### Fișele nu se sincronizează cu Telegram
- Verificați dacă Bot Token și Group ID sunt corecte
- Verificați dacă bot-ul este în grup
- Apăsați **Test** în Setări pentru a verifica conexiunea

### Aplicația se blochează
- Ștergeți cache-ul aplicației
- Dezinstalați și reinstalați aplicația
- Verificați dacă dispozitivul are suficient spațiu

### Fișele dispar după restart
- Verificați dacă aplicația are permisiuni de stocare
- Exportați datele regulat pentru backup

## Contactare Support

Pentru probleme sau sugestii:
- Verificați documentația în BUILD_APK.md
- Consultați Telegram pentru sincronizare
- Contactați administratorul sistemului

---

**Versiune**: 1.0.0  
**Limbă**: Română  
**Ultima actualizare**: 08.01.2026
