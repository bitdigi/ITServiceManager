@echo off
setlocal EnableExtensions

cd /d "%~dp0"

echo ================================================
echo IT Service Manager - pornire server local LAN
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo EROARE: Node.js nu este instalat sau nu este in PATH.
  echo Instaleaza Node.js LTS si reporneste Windows.
  pause
  exit /b 1
)

where pnpm >nul 2>&1
if errorlevel 1 (
  echo EROARE: pnpm nu este instalat sau nu este in PATH.
  echo Ruleaza: corepack enable
  echo Apoi ruleaza: corepack prepare pnpm@9.12.0 --activate
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Se instaleaza dependentele proiectului. Asteapta finalizarea...
  call pnpm install
  if errorlevel 1 (
    echo EROARE: instalarea dependentelor a esuat.
    pause
    exit /b 1
  )
)

echo.
echo Se deschide serverul API pe portul 3000...
start "IT Service Manager API" /D "%~dp0" cmd /k "pnpm dev:server"

timeout /t 3 /nobreak >nul

echo Se deschide interfata web pe portul 8081, accesibila in reteaua LAN...
start "IT Service Manager Web" /D "%~dp0" cmd /k "pnpm exec expo start --web --host lan --port 8081"

timeout /t 4 /nobreak >nul

echo.
echo ================================================
echo Serverul local a fost pornit.
echo.
echo Pe acest PC:       http://localhost:8081
echo De pe alte device-uri: foloseste IP-ul IPv4 al acestui PC:
echo                      http://IP_PC:8081
echo.
echo Pentru a afla IP-ul, ruleaza: ipconfig
echo Exemplu:             http://192.168.1.100:8081
echo ================================================
echo Nu inchide ferestrele API si Web cat timp folosesti aplicatia.
echo.
pause
endlocal
