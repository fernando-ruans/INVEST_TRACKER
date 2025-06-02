from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.news_service import NewsService

router = APIRouter()

@router.get("/", response_model=dict)
async def get_financial_news(
    limit: int = Query(default=20, ge=1, le=100, description="Número de notícias a retornar"),
    category: Optional[str] = Query(default=None, description="Categoria de notícias (markets, economy, stocks, crypto)")
):
    """
    Obtém notícias financeiras gerais
    """
    try:
        if category:
            news = NewsService.get_market_news_by_category(category, limit)
        else:
            news = NewsService.get_financial_news(limit)
        
        return {"success": True, "data": news}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/asset/{symbol}", response_model=dict)
async def get_asset_news(
    symbol: str,
    limit: int = Query(default=10, ge=1, le=50, description="Número de notícias a retornar")
):
    """
    Obtém notícias específicas de um ativo
    """
    try:
        news = NewsService.get_asset_news(symbol.upper(), limit)
        return {"success": True, "data": news}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/categories", response_model=dict)
async def get_news_categories():
    """
    Retorna as categorias de notícias disponíveis
    """
    categories = [
        {
            "id": "markets",
            "name": "Mercados",
            "description": "Notícias sobre mercados financeiros em geral"
        },
        {
            "id": "economy",
            "name": "Economia",
            "description": "Notícias econômicas e indicadores"
        },
        {
            "id": "stocks",
            "name": "Ações",
            "description": "Notícias sobre ações e empresas"
        },
        {
            "id": "crypto",
            "name": "Criptomoedas",
            "description": "Notícias sobre criptomoedas e blockchain"
        },
        {
            "id": "commodities",
            "name": "Commodities",
            "description": "Notícias sobre commodities e matérias-primas"
        },
        {
            "id": "forex",
            "name": "Forex",
            "description": "Notícias sobre câmbio e moedas"
        }
    ]
    
    return {"success": True, "data": categories}

@router.get("/trending", response_model=dict)
async def get_trending_news(
    limit: int = Query(default=10, ge=1, le=20, description="Número de notícias trending a retornar")
):
    """
    Obtém notícias em alta/trending
    """
    try:
        # Por enquanto, retorna as notícias mais recentes como trending
        # Em uma implementação real, isso poderia ser baseado em engajamento, visualizações, etc.
        news = NewsService.get_financial_news(limit)
        
        # Simular score de trending baseado na recência
        for i, article in enumerate(news):
            article['trending_score'] = len(news) - i
            article['is_trending'] = True
        
        return {"success": True, "data": news}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=dict)
async def search_news(
    query: str = Query(..., min_length=2, description="Termo de busca"),
    limit: int = Query(default=15, ge=1, le=50, description="Número de resultados a retornar")
):
    """
    Busca notícias por termo
    """
    try:
        # Buscar em notícias gerais
        all_news = NewsService.get_financial_news(100)  # Buscar mais notícias para filtrar
        
        # Filtrar notícias que contenham o termo de busca
        query_lower = query.lower()
        filtered_news = []
        
        for article in all_news:
            if (query_lower in article.get('title', '').lower() or 
                query_lower in article.get('description', '').lower()):
                article['relevance_score'] = (
                    article.get('title', '').lower().count(query_lower) * 2 +
                    article.get('description', '').lower().count(query_lower)
                )
                filtered_news.append(article)
        
        # Ordenar por relevância
        filtered_news.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        # Limitar resultados
        result = filtered_news[:limit]
        
        return {
            "success": True, 
            "data": result,
            "total_found": len(filtered_news),
            "query": query
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sources", response_model=dict)
async def get_news_sources():
    """
    Retorna as fontes de notícias disponíveis
    """
    sources = [
        {
            "id": "yahoo_finance",
            "name": "Yahoo Finance",
            "url": "https://finance.yahoo.com",
            "description": "Portal financeiro com notícias e cotações",
            "active": True
        },
        {
            "id": "investing_com",
            "name": "Investing.com",
            "url": "https://investing.com",
            "description": "Portal de investimentos e análises",
            "active": True
        },
        {
            "id": "marketwatch",
            "name": "MarketWatch",
            "url": "https://marketwatch.com",
            "description": "Notícias e análises de mercado",
            "active": True
        },
        {
            "id": "reuters",
            "name": "Reuters",
            "url": "https://reuters.com",
            "description": "Agência de notícias internacional",
            "active": False
        },
        {
            "id": "bloomberg",
            "name": "Bloomberg",
            "url": "https://bloomberg.com",
            "description": "Terminal financeiro e notícias",
            "active": False
        }
    ]
    
    return {"success": True, "data": sources}

@router.get("/summary", response_model=dict)
async def get_news_summary():
    """
    Obtém resumo das notícias do dia
    """
    try:
        # Buscar notícias de diferentes categorias
        markets_news = NewsService.get_market_news_by_category("markets", 3)
        economy_news = NewsService.get_market_news_by_category("economy", 3)
        stocks_news = NewsService.get_market_news_by_category("stocks", 3)
        
        summary = {
            "markets": markets_news,
            "economy": economy_news,
            "stocks": stocks_news,
            "total_articles": len(markets_news) + len(economy_news) + len(stocks_news),
            "last_updated": NewsService.get_financial_news(1)[0].get('published_date') if NewsService.get_financial_news(1) else None
        }
        
        return {"success": True, "data": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/headlines", response_model=dict)
async def get_headlines(
    limit: int = Query(default=5, ge=1, le=10, description="Número de manchetes a retornar")
):
    """
    Obtém apenas as principais manchetes
    """
    try:
        news = NewsService.get_financial_news(limit)
        
        headlines = []
        for article in news:
            headlines.append({
                "title": article.get('title'),
                "url": article.get('url'),
                "source": article.get('source'),
                "published_date": article.get('published_date')
            })
        
        return {"success": True, "data": headlines}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))