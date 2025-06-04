# Investment Tracker - Script de Build para Produção
# Execute com: .\build.ps1

Write-Host "🏗️ Iniciando build do Investment Tracker..." -ForegroundColor Green

# Verificar se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o Python está instalado
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python não encontrado. Por favor, instale o Python primeiro." -ForegroundColor Red
    exit 1
}

# Build do Backend
Write-Host "🐍 Preparando backend..." -ForegroundColor Yellow
Set-Location backend

# Instalar dependências do backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Cyan
pip install -r requirements.txt

# Criar diretórios necessários
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" -Force
    Write-Host "📁 Diretório uploads criado" -ForegroundColor Green
}

if (-not (Test-Path "uploads\avatars")) {
    New-Item -ItemType Directory -Path "uploads\avatars" -Force
    Write-Host "📁 Diretório uploads/avatars criado" -ForegroundColor Green
}

Set-Location ..

# Build do Frontend
Write-Host "⚛️ Preparando frontend..." -ForegroundColor Yellow
Set-Location frontend

# Instalar dependências do frontend
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Cyan
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}

# Build do frontend
Write-Host "🔨 Fazendo build do frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build do frontend concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build do frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Verificar se o banco de dados está configurado
Write-Host "🗄️ Verificando configuração do banco de dados..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo .env não encontrado. Copie o .env.example e configure as variáveis." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Build concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos para deploy:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente no servidor" -ForegroundColor White
Write-Host "2. Execute o banco de dados: python setup_database.py" -ForegroundColor White
Write-Host "3. Para produção, use: uvicorn main:app --host 0.0.0.0 --port 8000" -ForegroundColor White
Write-Host "4. Sirva os arquivos do frontend/build com um servidor web" -ForegroundColor White
Write-Host ""
Write-Host "📁 Arquivos de build:" -ForegroundColor Cyan
Write-Host "- Backend: backend/ (pronto para uvicorn)" -ForegroundColor White
Write-Host "- Frontend: frontend/build/ (arquivos estáticos)" -ForegroundColor White