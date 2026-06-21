@echo off
title Mentoria Conjunta - LOCAL (PostgreSQL Local)
echo ============================================
echo   Mentoria Conjunta - Ambiente LOCAL
echo ============================================
echo.

REM Carrega variaveis do .env.local
for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env.local") do (
    set "%%A=%%B"
)

set NODE_ENV=development
set API_PORT=%PORT%
set VITE_PORT=5020

REM Procura psql no PATH ou em caminhos padrão do PostgreSQL
set PSQL_CMD=psql
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Tenta encontrar PostgreSQL instalado
    for /d %%D in ("C:\Program Files\PostgreSQL\*") do (
        if exist "%%D\bin\psql.exe" (
            set "PSQL_CMD=%%D\bin\psql.exe"
            set "PATH=%%D\bin;%PATH%"
        )
    )
)

REM Verifica se psql esta disponivel
where "%PSQL_CMD%" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] psql nao encontrado. Certifique-se de que o PostgreSQL esta instalado.
    echo Pulando configuracao do banco local...
    goto :start_app
)

echo Verificando banco de dados local...

REM Cria usuario se nao existir
"%PSQL_CMD%" -h localhost -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='mentoria_conjunta_usr'" | findstr /C:"1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Criando usuario mentoria_conjunta_usr...
    "%PSQL_CMD%" -h localhost -U postgres -c "CREATE USER mentoria_conjunta_usr WITH PASSWORD 'mentoria123';"
)

REM Cria banco se nao existir
"%PSQL_CMD%" -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='mentoria_conjunta_db'" | findstr /C:"1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Criando banco mentoria_conjunta_db...
    "%PSQL_CMD%" -h localhost -U postgres -c "CREATE DATABASE mentoria_conjunta_db;"
    "%PSQL_CMD%" -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mentoria_conjunta_db TO mentoria_conjunta_usr;"
    "%PSQL_CMD%" -h localhost -U postgres -d mentoria_conjunta_db -c "GRANT ALL ON SCHEMA public TO mentoria_conjunta_usr;"
    "%PSQL_CMD%" -h localhost -U postgres -d mentoria_conjunta_db -c "GRANT CREATE ON SCHEMA public TO mentoria_conjunta_usr;"
    "%PSQL_CMD%" -h localhost -U postgres -d mentoria_conjunta_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mentoria_conjunta_usr;"
    "%PSQL_CMD%" -h localhost -U postgres -d mentoria_conjunta_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mentoria_conjunta_usr;"
)

REM Aplica schema com drizzle-kit
echo Aplicando schema (drizzle-kit push)...
cd /d "%~dp0"
pnpm exec drizzle-kit push --force

REM Cria tabela session se nao existir
echo Verificando tabela session...
"%PSQL_CMD%" -h localhost -U mentoria_conjunta_usr -d mentoria_conjunta_db -c "CREATE TABLE IF NOT EXISTS \"session\" (\"sid\" varchar NOT NULL COLLATE \"default\", \"sess\" json NOT NULL, \"expire\" timestamp(6) NOT NULL, CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\")); CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");"

:start_app
echo.
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
cd /d "%~dp0"
start "Mentoria-Conjunta API" /min cmd /c "cd /d "%~dp0" && pnpm exec tsx server/index.ts"

REM Aguarda backend inicializar
timeout /t 4 /nobreak >nul

REM Inicia frontend em primeiro plano
echo Iniciando Frontend (Vite)...
cd /d "%~dp0"
pnpm exec vite --port %VITE_PORT%

pause
