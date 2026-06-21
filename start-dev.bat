@echo off
title Mentoria Conjunta - DEV (Servidor Remoto)
echo ============================================
echo   Mentoria Conjunta - Ambiente DEV
echo ============================================
echo.

REM Carrega variaveis do .env-dev.txt
for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env-dev.txt") do (
    set "%%A=%%B"
)

set NODE_ENV=development
set API_PORT=%PORT%
set VITE_PORT=5020

echo DATABASE_URL=%DATABASE_URL%
echo.
echo API rodando na porta: %API_PORT%
echo Frontend (Vite) na porta: %VITE_PORT%
echo.
echo Acesse: http://localhost:%VITE_PORT%
echo ============================================
echo.

REM Inicia backend em segundo plano
echo Iniciando API...
start "Mentoria-Conjunta API" /min cmd /c "cd /d "%~dp0" && pnpm exec tsx server/index.ts"

REM Aguarda backend inicializar
timeout /t 4 /nobreak >nul

REM Inicia frontend em primeiro plano
echo Iniciando Frontend (Vite)...
cd /d "%~dp0"
pnpm exec vite --port %VITE_PORT%

pause
