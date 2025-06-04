# Investment Tracker - Script de Inicialização
# Execute com: .\start.ps1

Write-Host "🚀 Iniciando Investment Tracker..." -ForegroundColor Green

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

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências do projeto..." -ForegroundColor Yellow
    npm install
}

# Verificar se as dependências do frontend estão instaladas
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Verificar se as dependências do backend estão instaladas
Write-Host "📦 Verificando dependências do backend..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
Set-Location ..

# Iniciar os serviços
Write-Host "🎯 Iniciando frontend e backend simultaneamente..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Para parar os serviços, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

npm start