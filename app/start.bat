@echo off
cd /d "%~dp0"
echo Instalando dependencias (framer-motion removido - usa CSS puro)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar dependencias.
    pause
    exit /b 1
)
echo Corrigindo vulnerabilidades...
call npm audit fix
echo.
echo Iniciando servidor...
call npm run dev
pause
