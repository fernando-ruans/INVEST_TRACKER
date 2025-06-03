from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.services.portfolio_service import PortfolioService
from app.models.schemas import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse,
    PortfolioAssetCreate, PortfolioAssetUpdate, PortfolioAssetResponse
)

router = APIRouter()

@router.post("/", response_model=dict)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo portfolio
    """
    try:
        portfolio = PortfolioService.create_portfolio(db, portfolio_data)
        portfolio_response = PortfolioResponse.from_orm(portfolio)
        return {"success": True, "data": portfolio_response.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=dict)
async def get_portfolios(db: Session = Depends(get_db)):
    """
    Obtém todos os portfolios do usuário
    """
    try:
        portfolios = PortfolioService.get_portfolios(db)
        portfolios_response = [PortfolioResponse.from_orm(p).dict() for p in portfolios]
        return {"success": True, "data": portfolios_response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{portfolio_id}", response_model=dict)
async def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um portfolio específico
    """
    try:
        portfolio = PortfolioService.get_portfolio(db, portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio não encontrado")
        portfolio_response = PortfolioResponse.from_orm(portfolio)
        return {"success": True, "data": portfolio_response.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{portfolio_id}", response_model=dict)
async def update_portfolio(
    portfolio_id: int,
    portfolio_data: PortfolioUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um portfolio
    """
    try:
        portfolio = PortfolioService.update_portfolio(db, portfolio_id, portfolio_data)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio não encontrado")
        portfolio_response = PortfolioResponse.from_orm(portfolio)
        return {"success": True, "data": portfolio_response.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{portfolio_id}", response_model=dict)
async def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleta um portfolio
    """
    try:
        success = PortfolioService.delete_portfolio(db, portfolio_id)
        if not success:
            raise HTTPException(status_code=404, detail="Portfolio não encontrado")
        return {"success": True, "message": "Portfolio deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{portfolio_id}/assets", response_model=dict)
async def add_asset_to_portfolio(
    portfolio_id: int,
    asset_data: PortfolioAssetCreate,
    db: Session = Depends(get_db)
):
    """
    Adiciona um ativo ao portfolio
    """
    try:
        asset = PortfolioService.add_asset_to_portfolio(db, portfolio_id, asset_data)
        asset_response = PortfolioAssetResponse.from_orm(asset)
        return {"success": True, "data": asset_response.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{portfolio_id}/assets", response_model=dict)
async def get_portfolio_assets(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém todos os ativos de um portfolio
    """
    try:
        assets = PortfolioService.get_portfolio_assets(db, portfolio_id)
        # Como agora o serviço retorna dicionários, não precisamos usar from_orm
        return {"success": True, "data": assets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/assets/{asset_id}", response_model=dict)
async def update_portfolio_asset(
    asset_id: int,
    asset_data: PortfolioAssetUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza um ativo do portfolio
    """
    try:
        asset = PortfolioService.update_portfolio_asset(db, asset_id, asset_data)
        if not asset:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")
        asset_response = PortfolioAssetResponse.from_orm(asset)
        return {"success": True, "data": asset_response.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/assets/{asset_id}", response_model=dict)
async def remove_asset_from_portfolio(
    asset_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove um ativo do portfolio
    """
    try:
        success = PortfolioService.remove_asset_from_portfolio(db, asset_id)
        if not success:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")
        return {"success": True, "message": "Ativo removido com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{portfolio_id}/performance", response_model=dict)
async def get_portfolio_performance(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Calcula e retorna a performance de um portfolio
    """
    try:
        performance = PortfolioService.calculate_portfolio_performance(db, portfolio_id)
        return {"success": True, "data": performance}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{portfolio_id}/summary", response_model=dict)
async def get_portfolio_summary(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém resumo completo do portfolio (informações + ativos + performance)
    """
    try:
        # Buscar informações do portfolio
        portfolio = PortfolioService.get_portfolio(db, portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio não encontrado")
        
        # Buscar ativos
        assets = PortfolioService.get_portfolio_assets(db, portfolio_id)
        
        # Calcular performance
        performance = PortfolioService.calculate_portfolio_performance(db, portfolio_id)
        
        summary = {
            "portfolio": portfolio,
            "assets": assets,
            "performance": performance,
            "assets_count": len(assets)
        }
        
        return {"success": True, "data": summary}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{portfolio_id}/allocation", response_model=dict)
async def get_portfolio_allocation(
    portfolio_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém alocação de ativos do portfolio (distribuição por ativo)
    """
    try:
        performance = PortfolioService.calculate_portfolio_performance(db, portfolio_id)
        
        if not performance["assets_performance"]:
            return {"success": True, "data": []}
        
        total_value = performance["total_value"]
        
        allocation = []
        for asset in performance["assets_performance"]:
            if total_value > 0:
                percentage = (asset["current_value"] / total_value) * 100
            else:
                percentage = 0
            
            allocation.append({
                "symbol": asset["symbol"],
                "value": asset["current_value"],
                "percentage": round(percentage, 2),
                "quantity": asset["quantity"]
            })
        
        # Ordenar por valor decrescente
        allocation.sort(key=lambda x: x["value"], reverse=True)
        
        return {"success": True, "data": allocation}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{portfolio_id}/rebalance", response_model=dict)
async def suggest_portfolio_rebalance(
    portfolio_id: int,
    target_allocation: dict,
    db: Session = Depends(get_db)
):
    """
    Sugere rebalanceamento do portfolio baseado na alocação alvo
    """
    try:
        # Obter alocação atual
        current_allocation = await get_portfolio_allocation(portfolio_id, db)
        current_data = current_allocation["data"] if current_allocation["success"] else []
        
        # Calcular sugestões de rebalanceamento
        suggestions = []
        
        for asset in current_data:
            symbol = asset["symbol"]
            current_percentage = asset["percentage"]
            target_percentage = target_allocation.get(symbol, 0)
            
            difference = target_percentage - current_percentage
            
            if abs(difference) > 1:  # Apenas sugerir se diferença > 1%
                action = "buy" if difference > 0 else "sell"
                suggestions.append({
                    "symbol": symbol,
                    "current_percentage": current_percentage,
                    "target_percentage": target_percentage,
                    "difference": round(difference, 2),
                    "action": action,
                    "current_value": asset["value"]
                })
        
        return {"success": True, "data": suggestions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))