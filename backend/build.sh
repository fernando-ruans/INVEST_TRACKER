#!/usr/bin/env bash
set -o errexit

echo "🚀 Iniciando build do backend..."

# Atualizar pip
python -m pip install --upgrade pip

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p uploads/avatars

# Executar setup do banco (se necessário)
if [ "$SETUP_DB" = "true" ]; then
    echo "🗄️ Configurando banco de dados..."
    python setup_database.py
fi

echo "✅ Build concluído com sucesso!"