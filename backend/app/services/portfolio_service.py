from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database.database import Portfolio, PortfolioAsset, get_db
from app.models.schemas import PortfolioCreate, PortfolioUpdate, PortfolioAssetCreate, PortfolioAssetUpdate
from app.services.asset_service import AssetService

class PortfolioService:
    @staticmethod
    def create_portfolio(db: Session, portfolio_data: PortfolioCreate, user_id: int = 1) -> Portfolio:
        """
        Cria um novo portfolio
        """
        try:
            portfolio = Portfolio(
                name=portfolio_data.name,
                description=portfolio_data.description,
                user_id=user_id
            )
            
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)
            
            return portfolio
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao criar portfolio: {str(e)}")
    
    @staticmethod
    def get_portfolios(db: Session, user_id: int = 1) -> List[Portfolio]:
        """
        Obtém todos os portfolios de um usuário
        """
        try:
            return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
        except Exception as e:
            raise Exception(f"Erro ao buscar portfolios: {str(e)}")
    
    @staticmethod
    def get_portfolio(db: Session, portfolio_id: int, user_id: int = 1) -> Optional[Portfolio]:
        """
        Obtém um portfolio específico
        """
        try:
            return db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
        except Exception as e:
            raise Exception(f"Erro ao buscar portfolio: {str(e)}")
    
    @staticmethod
    def update_portfolio(db: Session, portfolio_id: int, portfolio_data: PortfolioUpdate, user_id: int = 1) -> Optional[Portfolio]:
        """
        Atualiza um portfolio
        """
        try:
            portfolio = db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not portfolio:
                return None
            
            if portfolio_data.name is not None:
                portfolio.name = portfolio_data.name
            if portfolio_data.description is not None:
                portfolio.description = portfolio_data.description
            
            portfolio.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(portfolio)
            
            return portfolio
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao atualizar portfolio: {str(e)}")
    
    @staticmethod
    def delete_portfolio(db: Session, portfolio_id: int, user_id: int = 1) -> bool:
        """
        Deleta um portfolio
        """
        try:
            portfolio = db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not portfolio:
                return False
            
            # Deletar todos os ativos do portfolio primeiro
            db.query(PortfolioAsset).filter(PortfolioAsset.portfolio_id == portfolio_id).delete()
            
            # Deletar o portfolio
            db.delete(portfolio)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao deletar portfolio: {str(e)}")
    
    @staticmethod
    def add_asset_to_portfolio(db: Session, portfolio_id: int, asset_data: PortfolioAssetCreate, user_id: int = 1) -> PortfolioAsset:
        """
        Adiciona um ativo ao portfolio
        """
        try:
            # Verificar se o portfolio existe e pertence ao usuário
            portfolio = db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not portfolio:
                raise Exception("Portfolio não encontrado")
            
            # Verificar se o ativo já existe no portfolio
            existing_asset = db.query(PortfolioAsset).filter(
                PortfolioAsset.portfolio_id == portfolio_id,
                PortfolioAsset.symbol == asset_data.symbol.upper()
            ).first()
            
            if existing_asset:
                # Se já existe, atualizar quantidade e preço médio
                total_value_existing = existing_asset.quantity * existing_asset.average_price
                total_value_new = asset_data.quantity * asset_data.average_price
                total_quantity = existing_asset.quantity + asset_data.quantity
                
                if total_quantity > 0:
                    avg_price = (total_value_existing + total_value_new) / total_quantity
                    existing_asset.quantity = total_quantity
                    existing_asset.average_price = avg_price
                    existing_asset.updated_at = datetime.utcnow()
                    
                    db.commit()
                    db.refresh(existing_asset)
                    return existing_asset
            
            # Criar novo ativo no portfolio
            portfolio_asset = PortfolioAsset(
                portfolio_id=portfolio_id,
                symbol=asset_data.symbol.upper(),
                quantity=asset_data.quantity,
                average_price=asset_data.average_price
            )
            
            db.add(portfolio_asset)
            db.commit()
            db.refresh(portfolio_asset)
            
            return portfolio_asset
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao adicionar ativo ao portfolio: {str(e)}")
    
    @staticmethod
    def get_portfolio_assets(db: Session, portfolio_id: int, user_id: int = 1) -> List[Dict[str, Any]]:
        """
        Obtém todos os ativos de um portfolio
        """
        try:
            # Verificar se o portfolio pertence ao usuário
            portfolio = db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not portfolio:
                raise Exception("Portfolio não encontrado")
            
            # Obter todos os ativos do portfólio
            assets = db.query(PortfolioAsset).filter(PortfolioAsset.portfolio_id == portfolio_id).all()
            
            # Lista para armazenar os ativos com preços atuais
            assets_with_prices = []
            
            # Buscar preços atuais para cada ativo
            for asset in assets:
                try:
                    print(f"Buscando informações para o ativo: {asset.symbol}")
                    asset_info = AssetService.get_asset_info(asset.symbol)
                    current_price = asset_info.get("current_price", 0)
                    print(f"Preço atual para {asset.symbol}: {current_price}")
                    
                    # Criar um dicionário com os dados do ativo e os valores calculados
                    asset_dict = {
                        "id": asset.id,
                        "portfolio_id": asset.portfolio_id,
                        "symbol": asset.symbol,
                        "quantity": asset.quantity,
                        "average_price": asset.average_price,
                        "current_price": current_price,
                        "total_value": asset.quantity * current_price,
                        "profit_loss": (asset.quantity * current_price) - (asset.quantity * asset.average_price),
                        "profit_loss_percent": ((current_price - asset.average_price) / asset.average_price * 100) if asset.average_price > 0 else 0,
                        "created_at": asset.created_at,
                        "updated_at": asset.updated_at
                    }
                    
                    assets_with_prices.append(asset_dict)
                    
                except Exception as e:
                    print(f"Erro ao buscar informações para o ativo {asset.symbol}: {str(e)}")
                    # Adicionar o ativo mesmo sem preço atual
                    asset_dict = {
                        "id": asset.id,
                        "portfolio_id": asset.portfolio_id,
                        "symbol": asset.symbol,
                        "quantity": asset.quantity,
                        "average_price": asset.average_price,
                        "current_price": 0,
                        "total_value": 0,
                        "profit_loss": 0,
                        "profit_loss_percent": 0,
                        "created_at": asset.created_at,
                        "updated_at": asset.updated_at
                    }
                    assets_with_prices.append(asset_dict)
            
            return assets_with_prices
            
        except Exception as e:
            raise Exception(f"Erro ao buscar ativos do portfolio: {str(e)}")
    
    @staticmethod
    def update_portfolio_asset(db: Session, asset_id: int, asset_data: PortfolioAssetUpdate, user_id: int = 1) -> Optional[PortfolioAsset]:
        """
        Atualiza um ativo do portfolio
        """
        try:
            # Buscar o ativo e verificar se pertence a um portfolio do usuário
            asset = db.query(PortfolioAsset).join(Portfolio).filter(
                PortfolioAsset.id == asset_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not asset:
                return None
            
            if asset_data.quantity is not None:
                asset.quantity = asset_data.quantity
            if asset_data.average_price is not None:
                asset.average_price = asset_data.average_price
            
            asset.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(asset)
            
            return asset
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao atualizar ativo do portfolio: {str(e)}")
    
    @staticmethod
    def remove_asset_from_portfolio(db: Session, asset_id: int, user_id: int = 1) -> bool:
        """
        Remove um ativo do portfolio
        """
        try:
            # Buscar o ativo e verificar se pertence a um portfolio do usuário
            asset = db.query(PortfolioAsset).join(
                Portfolio, PortfolioAsset.portfolio_id == Portfolio.id
            ).filter(
                PortfolioAsset.id == asset_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not asset:
                return False
            
            db.delete(asset)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao remover ativo do portfolio: {str(e)}")
    
    @staticmethod
    def calculate_portfolio_performance(db: Session, portfolio_id: int, user_id: int = 1) -> Dict[str, Any]:
        """
        Calcula a performance de um portfolio
        """
        try:
            # Verificar se o portfolio pertence ao usuário
            portfolio = db.query(Portfolio).filter(
                Portfolio.id == portfolio_id,
                Portfolio.user_id == user_id
            ).first()
            
            if not portfolio:
                raise Exception("Portfolio não encontrado")
            
            # Buscar todos os ativos do portfolio
            assets = db.query(PortfolioAsset).filter(PortfolioAsset.portfolio_id == portfolio_id).all()
            
            if not assets:
                return {
                    "total_value": 0,
                    "total_cost": 0,
                    "total_gain_loss": 0,
                    "total_gain_loss_percent": 0,
                    "assets_performance": []
                }
            
            total_value = 0
            total_cost = 0
            assets_performance = []
            
            # Obter símbolos únicos para buscar preços atuais
            symbols = [asset.symbol for asset in assets]
            current_prices = {}
            
            # Buscar preços atuais de todos os ativos
            for symbol in symbols:
                try:
                    print(f"Buscando informações para o ativo: {symbol}")
                    asset_info = AssetService.get_asset_info(symbol)
                    current_price = asset_info.get("current_price", 0)
                    print(f"Preço atual para {symbol}: {current_price}")
                    current_prices[symbol] = current_price
                except Exception as e:
                    print(f"Erro ao buscar informações para o ativo {symbol}: {str(e)}")
                    current_prices[symbol] = 0
            
            # Calcular performance de cada ativo
            for asset in assets:
                current_price = current_prices.get(asset.symbol, 0)
                asset_value = asset.quantity * current_price
                asset_cost = asset.quantity * asset.average_price
                asset_gain_loss = asset_value - asset_cost
                asset_gain_loss_percent = (asset_gain_loss / asset_cost * 100) if asset_cost > 0 else 0
                
                assets_performance.append({
                    "symbol": asset.symbol,
                    "quantity": asset.quantity,
                    "average_price": asset.average_price,
                    "current_price": current_price,
                    "total_cost": asset_cost,
                    "current_value": asset_value,
                    "gain_loss": asset_gain_loss,
                    "gain_loss_percent": asset_gain_loss_percent
                })
                
                total_value += asset_value
                total_cost += asset_cost
            
            total_gain_loss = total_value - total_cost
            total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0
            
            return {
                "total_value": total_value,
                "total_cost": total_cost,
                "total_gain_loss": total_gain_loss,
                "total_gain_loss_percent": total_gain_loss_percent,
                "assets_performance": assets_performance
            }
            
        except Exception as e:
            raise Exception(f"Erro ao calcular performance do portfolio: {str(e)}")