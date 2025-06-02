from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, date
from app.services.calendar_service import CalendarService

router = APIRouter()

@router.get("/events", response_model=dict)
async def get_economic_events(
    start_date: Optional[str] = Query(default=None, description="Data inicial (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(default=None, description="Data final (YYYY-MM-DD)"),
    country: Optional[str] = Query(default=None, description="Código do país (US, BR, EU, etc.)"),
    importance: Optional[str] = Query(default=None, description="Importância (low, medium, high)"),
    category: Optional[str] = Query(default=None, description="Categoria do evento"),
    limit: int = Query(default=50, ge=1, le=200, description="Número máximo de eventos")
):
    """
    Obtém eventos econômicos filtrados por critérios
    """
    try:
        # Converter strings de data para objetos date
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato de data inicial inválido. Use YYYY-MM-DD")
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Formato de data final inválido. Use YYYY-MM-DD")
        
        # Validar que data inicial não seja posterior à final
        if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
            raise HTTPException(status_code=400, detail="Data inicial não pode ser posterior à data final")
        
        events = CalendarService.get_economic_events(
            start_date=start_date_obj,
            end_date=end_date_obj,
            country=country,
            importance=importance,
            category=category,
            limit=limit
        )
        
        return {"success": True, "data": events, "count": len(events)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/today", response_model=dict)
async def get_today_events(
    country: Optional[str] = Query(default=None, description="Código do país"),
    importance: Optional[str] = Query(default=None, description="Importância (low, medium, high)")
):
    """
    Obtém eventos econômicos de hoje
    """
    try:
        events = CalendarService.get_today_events(country=country, importance=importance)
        return {"success": True, "data": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/week", response_model=dict)
async def get_week_events(
    country: Optional[str] = Query(default=None, description="Código do país"),
    importance: Optional[str] = Query(default=None, description="Importância (low, medium, high)")
):
    """
    Obtém eventos econômicos desta semana
    """
    try:
        events = CalendarService.get_week_events(country=country, importance=importance)
        return {"success": True, "data": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/upcoming", response_model=dict)
async def get_upcoming_events(
    days: int = Query(default=7, ge=1, le=30, description="Número de dias à frente"),
    country: Optional[str] = Query(default=None, description="Código do país"),
    importance: Optional[str] = Query(default=None, description="Importância (low, medium, high)"),
    limit: int = Query(default=20, ge=1, le=100, description="Número máximo de eventos")
):
    """
    Obtém próximos eventos econômicos
    """
    try:
        from datetime import timedelta
        
        start_date = date.today()
        end_date = start_date + timedelta(days=days)
        
        events = CalendarService.get_economic_events(
            start_date=start_date,
            end_date=end_date,
            country=country,
            importance=importance,
            limit=limit
        )
        
        return {"success": True, "data": events, "count": len(events)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/countries", response_model=dict)
async def get_available_countries():
    """
    Retorna lista de países disponíveis
    """
    countries = [
        {"code": "US", "name": "Estados Unidos", "flag": "🇺🇸"},
        {"code": "BR", "name": "Brasil", "flag": "🇧🇷"},
        {"code": "EU", "name": "União Europeia", "flag": "🇪🇺"},
        {"code": "GB", "name": "Reino Unido", "flag": "🇬🇧"},
        {"code": "JP", "name": "Japão", "flag": "🇯🇵"},
        {"code": "CN", "name": "China", "flag": "🇨🇳"},
        {"code": "CA", "name": "Canadá", "flag": "🇨🇦"},
        {"code": "AU", "name": "Austrália", "flag": "🇦🇺"},
        {"code": "DE", "name": "Alemanha", "flag": "🇩🇪"},
        {"code": "FR", "name": "França", "flag": "🇫🇷"},
        {"code": "IT", "name": "Itália", "flag": "🇮🇹"},
        {"code": "ES", "name": "Espanha", "flag": "🇪🇸"}
    ]
    
    return {"success": True, "data": countries}

@router.get("/categories", response_model=dict)
async def get_event_categories():
    """
    Retorna categorias de eventos disponíveis
    """
    categories = [
        {"id": "monetary_policy", "name": "Política Monetária", "description": "Decisões de taxa de juros, reuniões do banco central"},
        {"id": "employment", "name": "Emprego", "description": "Dados de emprego, desemprego, folha de pagamento"},
        {"id": "inflation", "name": "Inflação", "description": "Índices de preços, inflação"},
        {"id": "gdp", "name": "PIB", "description": "Produto Interno Bruto e crescimento econômico"},
        {"id": "trade", "name": "Comércio", "description": "Balança comercial, exportações, importações"},
        {"id": "manufacturing", "name": "Manufatura", "description": "Índices de manufatura, produção industrial"},
        {"id": "consumer", "name": "Consumidor", "description": "Confiança do consumidor, vendas no varejo"},
        {"id": "housing", "name": "Habitação", "description": "Dados do mercado imobiliário"},
        {"id": "earnings", "name": "Resultados", "description": "Divulgação de resultados corporativos"},
        {"id": "other", "name": "Outros", "description": "Outros eventos econômicos"}
    ]
    
    return {"success": True, "data": categories}

@router.get("/importance-levels", response_model=dict)
async def get_importance_levels():
    """
    Retorna níveis de importância disponíveis
    """
    levels = [
        {
            "id": "low",
            "name": "Baixa",
            "description": "Eventos com baixo impacto no mercado",
            "color": "#10B981",
            "icon": "📊"
        },
        {
            "id": "medium",
            "name": "Média",
            "description": "Eventos com impacto moderado no mercado",
            "color": "#F59E0B",
            "icon": "📈"
        },
        {
            "id": "high",
            "name": "Alta",
            "description": "Eventos com alto impacto no mercado",
            "color": "#EF4444",
            "icon": "🚨"
        }
    ]
    
    return {"success": True, "data": levels}

@router.get("/summary", response_model=dict)
async def get_calendar_summary():
    """
    Obtém resumo do calendário econômico
    """
    try:
        today_events = CalendarService.get_today_events()
        week_events = CalendarService.get_week_events()
        
        # Contar eventos por importância
        today_high = len([e for e in today_events if e.get('importance') == 'high'])
        today_medium = len([e for e in today_events if e.get('importance') == 'medium'])
        today_low = len([e for e in today_events if e.get('importance') == 'low'])
        
        week_high = len([e for e in week_events if e.get('importance') == 'high'])
        week_medium = len([e for e in week_events if e.get('importance') == 'medium'])
        week_low = len([e for e in week_events if e.get('importance') == 'low'])
        
        summary = {
            "today": {
                "total": len(today_events),
                "high_importance": today_high,
                "medium_importance": today_medium,
                "low_importance": today_low,
                "events": today_events[:5]  # Primeiros 5 eventos
            },
            "week": {
                "total": len(week_events),
                "high_importance": week_high,
                "medium_importance": week_medium,
                "low_importance": week_low
            },
            "next_high_impact": next(
                (e for e in week_events if e.get('importance') == 'high'),
                None
            )
        }
        
        return {"success": True, "data": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=dict)
async def search_events(
    query: str = Query(..., min_length=2, description="Termo de busca"),
    limit: int = Query(default=20, ge=1, le=100, description="Número máximo de resultados")
):
    """
    Busca eventos por termo
    """
    try:
        # Buscar eventos da próxima semana
        from datetime import timedelta
        
        start_date = date.today()
        end_date = start_date + timedelta(days=30)  # Próximos 30 dias
        
        all_events = CalendarService.get_economic_events(
            start_date=start_date,
            end_date=end_date,
            limit=200
        )
        
        # Filtrar eventos que contenham o termo de busca
        query_lower = query.lower()
        filtered_events = []
        
        for event in all_events:
            if (query_lower in event.get('title', '').lower() or 
                query_lower in event.get('description', '').lower() or
                query_lower in event.get('country', '').lower()):
                
                # Calcular score de relevância
                score = 0
                if query_lower in event.get('title', '').lower():
                    score += 3
                if query_lower in event.get('description', '').lower():
                    score += 2
                if query_lower in event.get('country', '').lower():
                    score += 1
                
                event['relevance_score'] = score
                filtered_events.append(event)
        
        # Ordenar por relevância e importância
        filtered_events.sort(
            key=lambda x: (x.get('relevance_score', 0), 
                          {'high': 3, 'medium': 2, 'low': 1}.get(x.get('importance', 'low'), 1)),
            reverse=True
        )
        
        # Limitar resultados
        result = filtered_events[:limit]
        
        return {
            "success": True,
            "data": result,
            "total_found": len(filtered_events),
            "query": query
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))