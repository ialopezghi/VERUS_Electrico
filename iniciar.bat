@echo off
title VERUS Electrico Local
cd /d "%~dp0"
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
start "" "http://localhost:3000"
npm run dev
echo.
echo  La aplicacion se ha detenido.
pause
