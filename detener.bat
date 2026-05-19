@echo off
title VERUS Electrico — Detener
echo.
echo  Deteniendo VERUS Electrico (puerto 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo  Aplicacion detenida.
echo.
pause
