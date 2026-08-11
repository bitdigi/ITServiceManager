# IT Service Manager — pornire locală în rețea

Acest ghid pornește interfața web și API-ul pe PC-ul Windows din service. Dispozitivele conectate la aceeași rețea Wi‑Fi sau Ethernet pot deschide aplicația din browser, fără APK și fără dependență de workspace-ul Manus.

## Ce trebuie instalat pe PC

| Componentă | Recomandare |
|---|---|
| Node.js | Versiunea LTS, instalată de pe [nodejs.org](https://nodejs.org/) |
| pnpm | `corepack enable`, apoi `corepack prepare pnpm@9.12.0 --activate` |
| Rețea | PC-ul și telefoanele trebuie să fie în aceeași rețea locală |
| Baza de date | `DATABASE_URL` trebuie configurat în fișierul `.env` al serverului local |

> Important: scriptul pornește serverul, dar baza de date trebuie să existe și să fie accesibilă de pe PC. Dacă baza de date rămâne pe infrastructura Manus, sincronizarea nu este încă 100% independentă de workspace. Pentru independență completă este necesară și migrarea bazei de date pe PC sau pe un server controlat de tine.

## Pornire

1. Copiază întregul proiect `ITServiceManager` pe PC-ul Windows, de exemplu în `C:\ITServiceManager`.
2. Configurează variabilele necesare în fișierul `.env`, în special `DATABASE_URL`. Nu publica tokenuri sau parole într-un fișier distribuit.
3. Dă dublu clic pe `start-it-service-manager.bat`.
4. Scriptul deschide două ferestre: una pentru API și una pentru interfața web.
5. În fereastra de comandă rulează `ipconfig` și identifică adresa **IPv4** a PC-ului, de exemplu `192.168.1.100`.
6. De pe orice dispozitiv din aceeași rețea deschide `http://192.168.1.100:8081`, înlocuind adresa cu IPv4-ul real al PC-ului.

## Acces pe dispozitive

| Dispozitiv | Browser | Adresă |
|---|---|---|
| Windows | Chrome sau Edge | `http://IP_PC:8081` |
| Android / Sunmi T2S | Chrome | `http://IP_PC:8081` |
| iOS (iPhone / iPad) | Safari | `http://IP_PC:8081` |

Pe iPhone sau iPad poți folosi **Share → Add to Home Screen** pentru a avea o pictogramă pe ecranul principal. Aplicația rulează în browser și nu necesită publicare în App Store.

## Firewall Windows

La prima pornire, Windows poate afișa o alertă pentru Node.js. Permite accesul pentru **Private networks**. Dacă interfața nu se deschide de pe telefon, verifică în Windows Defender Firewall o regulă inbound pentru porturile TCP **8081** și **3000**.

## Oprire

Închide cele două ferestre de comandă API și Web sau apasă `Ctrl+C` în fiecare fereastră. PC-ul trebuie să rămână pornit și conectat la rețea cât timp dispozitivele folosesc aplicația locală.

## Limitarea versiunii actuale

Această etapă pregătește rularea web în LAN. Pentru o soluție complet independentă de workspace, următorul pas este să mutăm și baza de date plus secretele pe PC-ul tău, apoi să configurăm backup automat. După aceea APK-ul și interfața web trebuie configurate să folosească adresa locală a API-ului, nu domeniul Manus.
