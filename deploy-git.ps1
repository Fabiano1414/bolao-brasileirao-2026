# Script para enviar o Bolão Brasileirão 2026 ao GitHub
# Execute no PowerShell: .\deploy-git.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Deploy Git - Bolão Brasileirão 2026 ===" -ForegroundColor Cyan
Write-Host ""

# Ir para a pasta do projeto
Set-Location $PSScriptRoot

# Verificar se git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Git nao instalado. Baixe em https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Configurar identidade do Git (necessario para o commit)
if (-not (git config user.name 2>$null)) {
    Write-Host "0. Configurando Git (primeira vez)..." -ForegroundColor Yellow
    git config --global user.name "Fabiano"
    git config --global user.email "Fabiano1414@users.noreply.github.com"
    Write-Host "   Para usar outro nome/email, edite depois com: git config --global user.name / user.email" -ForegroundColor Gray
}

# Inicializar e enviar
Write-Host "1. Inicializando Git..." -ForegroundColor Green
git init 2>$null

Write-Host "2. Adicionando arquivos..." -ForegroundColor Green
git add .

Write-Host "3. Criando commit..." -ForegroundColor Green
git commit -m "Bolao Brasileirao 2026 - app completo" 2>$null
if ($LASTEXITCODE -ne 0) {
    # Pode falhar se nao houver alteracoes
    Write-Host "   (Commit ja existente ou sem alteracoes)" -ForegroundColor Gray
}

Write-Host "4. Conectando ao GitHub..." -ForegroundColor Green
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin https://github.com/Fabiano1414/bolao-brasileirao-2026.git
}

Write-Host "5. Enviando para GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "=== Concluido! ===" -ForegroundColor Green
Write-Host "Agora va na Vercel e importe o repositorio bolao-brasileirao-2026" -ForegroundColor Cyan
