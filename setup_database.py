#!/usr/bin/env python3
"""
Script para configuração e migração do banco de dados Investment Tracker
Compatível com PostgreSQL e SQLite
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.database.database import Base, engine, init_db

def load_environment():
    """Carrega as variáveis de ambiente"""
    load_dotenv()
    return os.getenv("DATABASE_URL", "sqlite:///./investment_tracker.db")

def check_database_connection(database_url):
    """Verifica se é possível conectar ao banco de dados"""
    try:
        test_engine = create_engine(database_url)
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Conexão com o banco de dados estabelecida com sucesso!")
        return True
    except SQLAlchemyError as e:
        print(f"❌ Erro ao conectar com o banco de dados: {e}")
        return False

def create_tables():
    """Cria todas as tabelas do banco de dados"""
    try:
        print("📋 Criando tabelas do banco de dados...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        return True
    except SQLAlchemyError as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def check_tables_exist():
    """Verifica se as tabelas existem no banco de dados"""
    try:
        with engine.connect() as conn:
            # Lista de tabelas esperadas
            expected_tables = [
                'users', 'portfolios', 'portfolio_assets', 
                'watchlists', 'watchlist_items', 
                'user_verifications', 'password_resets'
            ]
            
            existing_tables = []
            for table in expected_tables:
                try:
                    result = conn.execute(text(f"SELECT 1 FROM {table} LIMIT 1"))
                    existing_tables.append(table)
                except:
                    pass
            
            print(f"📊 Tabelas encontradas: {len(existing_tables)}/{len(expected_tables)}")
            for table in existing_tables:
                print(f"  ✅ {table}")
            
            missing_tables = set(expected_tables) - set(existing_tables)
            if missing_tables:
                print("❌ Tabelas faltando:")
                for table in missing_tables:
                    print(f"  ❌ {table}")
                return False
            
            return True
    except SQLAlchemyError as e:
        print(f"❌ Erro ao verificar tabelas: {e}")
        return False

def create_uploads_directory():
    """Cria o diretório de uploads para avatars"""
    try:
        uploads_dir = Path("backend/uploads/avatars")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        print("✅ Diretório de uploads criado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar diretório de uploads: {e}")
        return False

def show_database_info():
    """Mostra informações sobre o banco de dados"""
    database_url = load_environment()
    print("\n" + "="*50)
    print("📊 INFORMAÇÕES DO BANCO DE DADOS")
    print("="*50)
    print(f"URL: {database_url}")
    
    if "postgresql" in database_url:
        print("Tipo: PostgreSQL")
    elif "sqlite" in database_url:
        print("Tipo: SQLite")
    else:
        print("Tipo: Desconhecido")
    
    print("="*50)

def main():
    """Função principal do script"""
    print("🚀 Investment Tracker - Setup do Banco de Dados")
    print("="*50)
    
    # Carregar configurações
    database_url = load_environment()
    show_database_info()
    
    # Verificar conexão
    if not check_database_connection(database_url):
        print("\n❌ Não foi possível conectar ao banco de dados.")
        print("Verifique as configurações no arquivo .env")
        return False
    
    # Verificar se as tabelas já existem
    if check_tables_exist():
        print("\n✅ Todas as tabelas já existem no banco de dados!")
        response = input("\nDeseja recriar as tabelas? (s/N): ").lower()
        if response != 's':
            print("✅ Setup concluído - banco de dados já configurado!")
            return True
    
    # Criar tabelas
    if not create_tables():
        return False
    
    # Criar diretório de uploads
    create_uploads_directory()
    
    # Verificar se tudo foi criado corretamente
    if check_tables_exist():
        print("\n🎉 Setup do banco de dados concluído com sucesso!")
        print("\n📋 Próximos passos:")
        print("1. Execute o backend: cd backend && python main.py")
        print("2. Execute o frontend: cd frontend && npm start")
        print("3. Acesse http://localhost:3000")
        return True
    else:
        print("\n❌ Erro durante o setup. Verifique os logs acima.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)