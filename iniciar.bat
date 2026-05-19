@echo off
title VERUS Electrico Local
cd /d "%~dp0"

if not exist ".env" (
    echo  Creando .env desde .env.example...
    copy ".env.example" ".env" >nul
)

echo  Liberando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo  ====================================
echo   VERUS Electrico iniciando...
echo   http://localhost:3000
echo  ====================================
echo.
echo  Instalando dependencias...
call npm install
echo.
echo  Arrancando servidor...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
npm run dev
echo.
echo  La aplicacion se ha detenido.
pause
