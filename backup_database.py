#!/usr/bin/env python3
"""
Script para backup e restore do banco de dados Investment Tracker
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.database.database import User, Portfolio, PortfolioAsset, Watchlist, WatchlistItem

def load_environment():
    """Carrega as variáveis de ambiente"""
    load_dotenv()
    return os.getenv("DATABASE_URL", "sqlite:///./investment_tracker.db")

def create_session():
    """Cria uma sessão do banco de dados"""
    database_url = load_environment()
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def backup_data(output_file=None):
    """Faz backup dos dados do banco"""
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"backup_investment_tracker_{timestamp}.json"
    
    print(f"📦 Iniciando backup para: {output_file}")
    
    session = create_session()
    backup_data = {
        "timestamp": datetime.now().isoformat(),
        "version": "1.0",
        "data": {
            "users": [],
            "portfolios": [],
            "portfolio_assets": [],
            "watchlists": [],
            "watchlist_items": []
        }
    }
    
    try:
        # Backup usuários (sem senhas por segurança)
        users = session.query(User).all()
        for user in users:
            backup_data["data"]["users"].append({
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "avatar": user.avatar,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            })
        
        # Backup portfólios
        portfolios = session.query(Portfolio).all()
        for portfolio in portfolios:
            backup_data["data"]["portfolios"].append({
                "id": portfolio.id,
                "name": portfolio.name,
                "description": portfolio.description,
                "user_id": portfolio.user_id,
                "created_at": portfolio.created_at.isoformat() if portfolio.created_at else None,
                "updated_at": portfolio.updated_at.isoformat() if portfolio.updated_at else None
            })
        
        # Backup ativos dos portfólios
        assets = session.query(PortfolioAsset).all()
        for asset in assets:
            backup_data["data"]["portfolio_assets"].append({
                "id": asset.id,
                "portfolio_id": asset.portfolio_id,
                "symbol": asset.symbol,
                "quantity": float(asset.quantity),
                "average_price": float(asset.average_price),
                "created_at": asset.created_at.isoformat() if asset.created_at else None,
                "updated_at": asset.updated_at.isoformat() if asset.updated_at else None
            })
        
        # Backup watchlists
        watchlists = session.query(Watchlist).all()
        for watchlist in watchlists:
            backup_data["data"]["watchlists"].append({
                "id": watchlist.id,
                "name": watchlist.name,
                "user_id": watchlist.user_id,
                "created_at": watchlist.created_at.isoformat() if watchlist.created_at else None,
                "updated_at": watchlist.updated_at.isoformat() if watchlist.updated_at else None
            })
        
        # Backup itens das watchlists
        items = session.query(WatchlistItem).all()
        for item in items:
            backup_data["data"]["watchlist_items"].append({
                "id": item.id,
                "watchlist_id": item.watchlist_id,
                "symbol": item.symbol,
                "name": item.name,
                "added_at": item.added_at.isoformat() if item.added_at else None
            })
        
        # Salvar arquivo de backup
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Backup concluído com sucesso!")
        print(f"📊 Estatísticas do backup:")
        print(f"   - Usuários: {len(backup_data['data']['users'])}")
        print(f"   - Portfólios: {len(backup_data['data']['portfolios'])}")
        print(f"   - Ativos: {len(backup_data['data']['portfolio_assets'])}")
        print(f"   - Watchlists: {len(backup_data['data']['watchlists'])}")
        print(f"   - Itens watchlist: {len(backup_data['data']['watchlist_items'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante o backup: {e}")
        return False
    finally:
        session.close()

def restore_data(input_file):
    """Restaura dados do backup"""
    if not os.path.exists(input_file):
        print(f"❌ Arquivo de backup não encontrado: {input_file}")
        return False
    
    print(f"📥 Iniciando restore do arquivo: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        print(f"📅 Backup criado em: {backup_data['timestamp']}")
        print(f"🔢 Versão: {backup_data['version']}")
        
        # Confirmar restore
        response = input("\n⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER os dados existentes. Continuar? (s/N): ")
        if response.lower() != 's':
            print("❌ Restore cancelado pelo usuário.")
            return False
        
        session = create_session()
        
        # Limpar dados existentes (cuidado!)
        print("🗑️  Limpando dados existentes...")
        session.query(WatchlistItem).delete()
        session.query(Watchlist).delete()
        session.query(PortfolioAsset).delete()
        session.query(Portfolio).delete()
        # Não deletar usuários por segurança
        
        # Restaurar dados
        print("📥 Restaurando dados...")
        
        # Restaurar portfólios
        for portfolio_data in backup_data['data']['portfolios']:
            portfolio = Portfolio(
                name=portfolio_data['name'],
                description=portfolio_data['description'],
                user_id=portfolio_data['user_id']
            )
            session.add(portfolio)
        
        session.commit()
        
        # Restaurar ativos (precisa dos IDs dos portfólios)
        portfolios_map = {p.name: p.id for p in session.query(Portfolio).all()}
        
        for asset_data in backup_data['data']['portfolio_assets']:
            # Encontrar portfolio pelo nome (mais seguro que ID)
            portfolio_name = next(
                (p['name'] for p in backup_data['data']['portfolios'] 
                 if p['id'] == asset_data['portfolio_id']), None
            )
            
            if portfolio_name and portfolio_name in portfolios_map:
                asset = PortfolioAsset(
                    portfolio_id=portfolios_map[portfolio_name],
                    symbol=asset_data['symbol'],
                    quantity=asset_data['quantity'],
                    average_price=asset_data['average_price']
                )
                session.add(asset)
        
        # Restaurar watchlists
        for watchlist_data in backup_data['data']['watchlists']:
            watchlist = Watchlist(
                name=watchlist_data['name'],
                user_id=watchlist_data['user_id']
            )
            session.add(watchlist)
        
        session.commit()
        
        # Restaurar itens das watchlists
        watchlists_map = {w.name: w.id for w in session.query(Watchlist).all()}
        
        for item_data in backup_data['data']['watchlist_items']:
            watchlist_name = next(
                (w['name'] for w in backup_data['data']['watchlists'] 
                 if w['id'] == item_data['watchlist_id']), None
            )
            
            if watchlist_name and watchlist_name in watchlists_map:
                item = WatchlistItem(
                    watchlist_id=watchlists_map[watchlist_name],
                    symbol=item_data['symbol'],
                    name=item_data['name']
                )
                session.add(item)
        
        session.commit()
        
        print("✅ Restore concluído com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante o restore: {e}")
        return False
    finally:
        session.close()

def list_backups():
    """Lista arquivos de backup disponíveis"""
    backup_files = list(Path('.').glob('backup_investment_tracker_*.json'))
    
    if not backup_files:
        print("📭 Nenhum arquivo de backup encontrado.")
        return
    
    print("📋 Arquivos de backup disponíveis:")
    for backup_file in sorted(backup_files):
        stat = backup_file.stat()
        size = stat.st_size / 1024  # KB
        mtime = datetime.fromtimestamp(stat.st_mtime)
        print(f"  📄 {backup_file.name} ({size:.1f} KB) - {mtime.strftime('%d/%m/%Y %H:%M')}")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Backup e Restore do Investment Tracker')
    parser.add_argument('action', choices=['backup', 'restore', 'list'], 
                       help='Ação a ser executada')
    parser.add_argument('--file', '-f', help='Arquivo de backup')
    
    args = parser.parse_args()
    
    print("💾 Investment Tracker - Backup & Restore")
    print("="*50)
    
    if args.action == 'backup':
        success = backup_data(args.file)
    elif args.action == 'restore':
        if not args.file:
            print("❌ Arquivo de backup é obrigatório para restore.")
            print("Use: python backup_database.py restore --file backup_file.json")
            return False
        success = restore_data(args.file)
    elif args.action == 'list':
        list_backups()
        return True
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)