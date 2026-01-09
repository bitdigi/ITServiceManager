# Ghid Testare Sincronizare Multi-Dispozitiv

## Problema Inițială

Fișele create pe un telefon nu se sincronizau automat pe celălalt telefon, deși erau trimise pe Telegram.

## Soluția Implementată

**Sincronizare automată din Telegram** - Când deschideți aplicația, aceasta citește automat fișele din Telegram și le importă local.

## Cum Funcționează

1. **Trimitere pe Telegram**: Când salvați o fișă, aceasta este trimisă pe Telegram în format JSON
2. **Stocare locală**: Fișa este salvată în AsyncStorage pe telefon
3. **Sincronizare automată**: La lansarea aplicației, aceasta citește mesajele din Telegram și importă fișele noi

## Pași de Testare

### Setup Inițial

1. **Instalați aplicația pe 2 telefoane** (Telefon A și Telefon B)
2. **Configurați Telegram pe ambele telefoane**:
   - Deschideți Settings
   - Introduceți același Bot Token
   - Introduceți același Group ID
   - Apăsați "Test" pentru a verifica conexiunea

### Test 1: Sincronizare Automată la Lansare

**Telefon A:**
1. Deschideți aplicația
2. Apăsați "+" pentru a adăuga o nouă fișă
3. Completați formularul și apăsați "Salvează Fișă"
4. Verificați că fișa apare pe Telegram (în grup)

**Telefon B:**
1. Deschideți aplicația (sau relansați dacă era deja deschisă)
2. Aplicația va sincroniza automat fișele din Telegram
3. **Rezultat așteptat**: Fișa creată pe Telefon A apare pe Telefon B

### Test 2: Sincronizare Manuală

**Telefon B:**
1. Apăsați butonul "Sincronizare" pe Home screen
2. Aplicația va prelua din nou fișele din Telegram
3. **Rezultat așteptat**: Se afișează mesajul "X fișe sincronizate"

### Test 3: Ștergere și Sincronizare

**Telefon A:**
1. Deschideți o fișă
2. Apăsați "Ștergere" și confirmați
3. Fișa este ștearsă din local și din Telegram

**Telefon B:**
1. Relansați aplicația
2. **Rezultat așteptat**: Fișa ștearsă nu mai apare

### Test 4: Editare și Sincronizare

**Telefon A:**
1. Deschideți o fișă
2. Apăsați "Editare"
3. Modificați informații (ex: schimbați statusul)
4. Apăsați "Salvează Fișă"

**Telefon B:**
1. Relansați aplicația
2. **Rezultat așteptat**: Fișa are informațiile actualizate

## Format Mesaj Telegram

Fiecare fișă este trimisă pe Telegram în format:

```
📋 FIȘĂ DE SERVICE
[Detalii formatate]

```json
{
  "id": "unique-id",
  "clientName": "...",
  "clientPhone": "...",
  ...
}
```
```

Aplicația citește datele JSON din mesaj pentru sincronizare.

## Troubleshooting

### Fișele nu se sincronizează

**Verificați:**
1. Bot Token și Group ID sunt corecte
2. Bot-ul este în grup și are permisii de scriere
3. Apăsați "Test" în Settings pentru a verifica conexiunea
4. Relansați aplicația

### Fișe duplicate

**Cauza**: Fișa a fost importată de mai multe ori  
**Soluție**: Aplicația detectează duplicate prin ID și nu le importă din nou

### Mesajele Telegram nu sunt citite

**Verificați:**
1. Mesajele sunt trimise în grupul corect
2. ID-ul grupului este negativ (ex: -1001234567890)
3. Mesajele conțin JSON valid în code block

## Limitări Actuale

1. **Sincronizare doar la lansare**: Aplicația sincronizează doar când este lansată
2. **Fără sincronizare în fundal**: Nu se sincronizează automat în timp ce aplicația rulează
3. **Fără notificări**: Nu primiți notificare când o fișă nouă este sincronizată

## Viitor

Planuri de îmbunătățire:
- Sincronizare periodică în fundal (fiecare 5-10 minute)
- Notificări push când fișe noi sunt sincronizate
- Conflict resolution pentru editări simultane

## Contact

Pentru probleme sau sugestii, consultați BUILD_APK.md și USER_GUIDE.md.

---

**Versiune**: 1.0.0  
**Data**: 08.01.2026  
**Limbă**: Română
