#!/usr/bin/env bash
set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p uploads/avatars

# Executar setup do banco (se necessário)
if [ "$SETUP_DB" = "true" ]; then
    python setup_database.py
fi

echo "Build concluído com sucesso!"