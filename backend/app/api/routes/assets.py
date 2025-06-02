from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.asset_service import AssetService
from app.models.schemas import AssetInfo, HistoricalData, AssetSearch

router = APIRouter()

@router.get("/info/{symbol}", response_model=dict)
async def get_asset_info(symbol: str):
    """
    Obtém informações detalhadas de um ativo financeiro
    """
    try:
        asset_info = AssetService.get_asset_info(symbol)
        return {"success": True, "data": asset_info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/historical/{symbol}", response_model=dict)
async def get_historical_data(
    symbol: str,
    period: str = Query(default="1y", description="Período (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"),
    interval: str = Query(default="1d", description="Intervalo (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)")
):
    """
    Obtém dados históricos de um ativo
    """
    try:
        historical_data = AssetService.get_historical_data(symbol, period, interval)
        return {"success": True, "data": historical_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=dict)
async def search_assets(
    query: str = Query(..., description="Termo de busca (símbolo ou nome da empresa)"),
    limit: int = Query(default=10, ge=1, le=50, description="Número máximo de resultados")
):
    """
    Busca ativos por nome ou símbolo
    """
    try:
        search_results = AssetService.search_assets(query, limit)
        return {"success": True, "data": search_results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/market-overview", response_model=dict)
async def get_market_overview():
    """
    Obtém visão geral do mercado com principais índices
    """
    try:
        market_data = AssetService.get_market_overview()
        return {"success": True, "data": market_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/multiple", response_model=dict)
async def get_multiple_assets(symbols: List[str]):
    """
    Obtém informações de múltiplos ativos de uma vez
    """
    try:
        if len(symbols) > 20:
            raise HTTPException(status_code=400, detail="Máximo de 20 símbolos por requisição")
        
        assets_data = AssetService.get_multiple_assets(symbols)
        return {"success": True, "data": assets_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/quote/{symbol}", response_model=dict)
async def get_quick_quote(symbol: str):
    """
    Obtém cotação rápida de um ativo (apenas preço atual e variação)
    """
    try:
        asset_info = AssetService.get_asset_info(symbol)
        
        # Retornar apenas informações essenciais para cotação rápida
        quick_quote = {
            "symbol": asset_info["symbol"],
            "name": asset_info["name"],
            "current_price": asset_info["current_price"],
            "change": asset_info["change"],
            "change_percent": asset_info["change_percent"],
            "volume": asset_info["volume"],
            "currency": asset_info["currency"]
        }
        
        return {"success": True, "data": quick_quote}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trending", response_model=dict)
async def get_trending_assets():
    """
    Obtém lista de ativos em tendência (simulado)
    """
    try:
        # Lista de ativos populares para demonstração
        trending_symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX"]
        
        trending_data = AssetService.get_multiple_assets(trending_symbols)
        
        # Ordenar por volume (simulando tendência)
        trending_list = []
        for symbol, data in trending_data.items():
            if "error" not in data:
                trending_list.append(data)
        
        # Ordenar por volume decrescente
        trending_list.sort(key=lambda x: x.get("volume", 0), reverse=True)
        
        return {"success": True, "data": trending_list[:10]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sectors", response_model=dict)
async def get_sector_performance():
    """
    Obtém performance por setor (simulado)
    """
    try:
        # Representantes de setores para demonstração
        sector_representatives = {
            "Technology": ["AAPL", "GOOGL", "MSFT"],
            "Healthcare": ["JNJ", "UNH", "PFE"],
            "Financial": ["JPM", "BAC", "WFC"],
            "Consumer Discretionary": ["AMZN", "TSLA", "HD"],
            "Energy": ["XOM", "CVX", "COP"]
        }
        
        sector_performance = {}
        
        for sector, symbols in sector_representatives.items():
            try:
                sector_data = AssetService.get_multiple_assets(symbols)
                
                # Calcular performance média do setor
                total_change = 0
                valid_assets = 0
                
                for symbol, data in sector_data.items():
                    if "error" not in data and data.get("change_percent") is not None:
                        total_change += data["change_percent"]
                        valid_assets += 1
                
                avg_change = total_change / valid_assets if valid_assets > 0 else 0
                
                sector_performance[sector] = {
                    "name": sector,
                    "change_percent": round(avg_change, 2),
                    "assets_count": valid_assets,
                    "representative_assets": symbols
                }
            except:
                continue
        
        return {"success": True, "data": sector_performance}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))