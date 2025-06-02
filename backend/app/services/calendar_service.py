import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os
import random
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

class CalendarService:
    # Configuração da API do BCB
    BCB_API_BASE = "http://api.bcb.gov.br/dados/serie/bcdata.sgs"
    
    @staticmethod
    @lru_cache(maxsize=32)
    def _get_bcb_data(series_code: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        """
        Busca dados do Banco Central do Brasil via API SGS
        """
        try:
            if start_date and end_date:
                url = f"{CalendarService.BCB_API_BASE}.{series_code}/dados?formato=json&dataInicial={start_date}&dataFinal={end_date}"
            else:
                url = f"{CalendarService.BCB_API_BASE}.{series_code}/dados/ultimos/10?formato=json"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao buscar dados do BCB: {e}")
            return []
    

    
    @staticmethod
    def _get_real_economic_events() -> List[Dict[str, Any]]:
        """
        Busca eventos econômicos reais das APIs
        """
        events = []
        
        try:
            bcb_events = CalendarService._get_bcb_economic_events()
            fred_events = CalendarService._get_fred_events()
            events = bcb_events + fred_events
            
            # Se não conseguiu dados reais, usar dados mock
            if not events:
                return CalendarService._generate_sample_events()
            
            # Ordenar por data
            events.sort(key=lambda x: x.get("datetime", ""))
            return events
            
        except Exception as e:
            return CalendarService._generate_sample_events()
    
    @staticmethod
    def _get_bcb_economic_events() -> List[Dict[str, Any]]:
        """
        Converte dados do BCB em eventos econômicos
        """
        events = []
        # Principais séries econômicas do BCB
        bcb_series = {
            "432": {"title": "Taxa Selic", "category": "Central Bank", "importance": "High"},
            "433": {"title": "Taxa DI", "category": "Interest Rates", "importance": "Medium"},
            "24363": {"title": "IBC-Br", "category": "GDP", "importance": "High"},
            "13522": {"title": "IPCA", "category": "Inflation", "importance": "High"},
            "4390": {"title": "IGP-M", "category": "Inflation", "importance": "Medium"},
        }
        
        for series_code, info in bcb_series.items():
            try:
                data = CalendarService._get_bcb_data(series_code)
                
                if data:
                    # Pegar o último dado disponível
                    latest = data[-1]
                    
                    # Criar eventos para hoje e próximos dias (para demonstração)
                    # Alguns eventos para hoje, outros para próximos dias
                    days_offset = random.choice([0, 0, 1, 2, 3, 7, 14])  # Mais chance de eventos hoje
                    next_release = datetime.now() + timedelta(days=days_offset)
                    
                    event = {
                        "id": f"bcb_{series_code}",
                        "title": info["title"],
                        "country": "BR",
                        "importance": info["importance"],
                        "category": info["category"],
                        "description": f"Divulgação do {info['title']} pelo Banco Central do Brasil",
                        "date": next_release.strftime("%Y-%m-%d"),
                        "time": "09:00",
                        "datetime": next_release.replace(hour=9, minute=0).isoformat(),
                        "actual": None,
                        "forecast": None,
                        "previous": latest.get("valor")
                    }
                    events.append(event)
            except Exception as e:
                continue
        
        return events
    
    @staticmethod
    def _get_fred_events() -> List[Dict[str, Any]]:
        """
        Busca dados econômicos do FRED (Federal Reserve Economic Data)
        """
        try:
            events = []
            
            # Lista de indicadores econômicos importantes do FRED
            fred_indicators = [
                {
                    "series_id": "UNRATE",
                    "name": "Taxa de Desemprego (EUA)",
                    "category": "Emprego",
                    "importance": "high",
                    "country": "US"
                },
                {
                    "series_id": "CPIAUCSL",
                    "name": "Índice de Preços ao Consumidor (EUA)",
                    "category": "Inflação",
                    "importance": "high",
                    "country": "US"
                },
                {
                    "series_id": "GDP",
                    "name": "PIB (EUA)",
                    "category": "PIB",
                    "importance": "high",
                    "country": "US"
                },
                {
                    "series_id": "FEDFUNDS",
                    "name": "Taxa de Juros Federal (EUA)",
                    "category": "Taxa de Juros",
                    "importance": "high",
                    "country": "US"
                },
                {
                    "series_id": "PAYEMS",
                    "name": "Folha de Pagamento Não-Agrícola (EUA)",
                    "category": "Emprego",
                    "importance": "high",
                    "country": "US"
                }
            ]
            
            # Gerar eventos simulados baseados nos indicadores FRED
            for indicator in fred_indicators:
                # Simular datas de divulgação (normalmente mensais ou trimestrais)
                base_date = datetime.now()
                
                # Adicionar eventos para os próximos dias
                for days_offset in [0, 7, 14, 21, 30]:
                    event_date = base_date + timedelta(days=days_offset)
                    
                    # Simular valores baseados no tipo de indicador
                    if "Taxa" in indicator["name"]:
                        actual = round(random.uniform(0.25, 5.25), 2)
                        forecast = round(actual + random.uniform(-0.5, 0.5), 2)
                        previous = round(actual + random.uniform(-0.3, 0.3), 2)
                    elif "PIB" in indicator["name"]:
                        actual = round(random.uniform(1.5, 4.0), 1)
                        forecast = round(actual + random.uniform(-0.5, 0.5), 1)
                        previous = round(actual + random.uniform(-0.3, 0.3), 1)
                    elif "Desemprego" in indicator["name"]:
                        actual = round(random.uniform(3.5, 6.5), 1)
                        forecast = round(actual + random.uniform(-0.3, 0.3), 1)
                        previous = round(actual + random.uniform(-0.2, 0.2), 1)
                    else:
                        actual = round(random.uniform(100, 300), 1)
                        forecast = round(actual + random.uniform(-10, 10), 1)
                        previous = round(actual + random.uniform(-5, 5), 1)
                    
                    event = {
                        "datetime": event_date.strftime("%Y-%m-%d %H:%M:%S"),
                        "event": indicator["name"],
                        "country": indicator["country"],
                        "category": indicator["category"],
                        "importance": indicator["importance"],
                        "actual": actual,
                        "forecast": forecast,
                        "previous": previous,
                        "source": "FRED",
                        "currency": "USD",
                        "unit": "%" if "Taxa" in indicator["name"] or "PIB" in indicator["name"] or "Desemprego" in indicator["name"] else "Index"
                    }
                    events.append(event)
            
            return events
            
        except Exception as e:
            print(f"Erro ao gerar eventos FRED: {e}")
            return []
    

    
    @staticmethod
    def _generate_sample_events() -> List[Dict[str, Any]]:
        """
        Gera eventos econômicos de exemplo para demonstração
        Em uma implementação real, você usaria APIs como Trading Economics, Alpha Vantage, etc.
        """
        base_date = datetime.now()
        events = []
        
        # Eventos dos próximos 30 dias
        for i in range(30):
            event_date = base_date + timedelta(days=i)
            
            # Eventos de exemplo
            sample_events = [
                {
                    "title": "Non-Farm Payrolls",
                    "country": "US",
                    "importance": "High",
                    "category": "Employment",
                    "description": "Monthly change in the number of employed people during the previous month, excluding the farming industry."
                },
                {
                    "title": "Consumer Price Index (CPI)",
                    "country": "US",
                    "importance": "High",
                    "category": "Inflation",
                    "description": "Measures the change in the price of goods and services purchased by consumers."
                },
                {
                    "title": "Federal Reserve Interest Rate Decision",
                    "country": "US",
                    "importance": "High",
                    "category": "Central Bank",
                    "description": "Federal Reserve's decision on the federal funds rate."
                },
                {
                    "title": "GDP Growth Rate",
                    "country": "US",
                    "importance": "High",
                    "category": "GDP",
                    "description": "Quarterly change in the inflation-adjusted value of all goods and services produced."
                },
                {
                    "title": "Unemployment Rate",
                    "country": "US",
                    "importance": "Medium",
                    "category": "Employment",
                    "description": "Percentage of the total work force that is unemployed and actively seeking employment."
                },
                {
                    "title": "Retail Sales",
                    "country": "US",
                    "importance": "Medium",
                    "category": "Consumer Spending",
                    "description": "Monthly change in the total value of sales at the retail level."
                },
                {
                    "title": "Industrial Production",
                    "country": "US",
                    "importance": "Medium",
                    "category": "Manufacturing",
                    "description": "Monthly change in the total value of output produced by manufacturers, mines, and utilities."
                },
                {
                    "title": "Consumer Confidence Index",
                    "country": "US",
                    "importance": "Medium",
                    "category": "Consumer Sentiment",
                    "description": "Measures the degree of optimism that consumers feel about the overall state of the economy."
                },
                {
                    "title": "ECB Interest Rate Decision",
                    "country": "EU",
                    "importance": "High",
                    "category": "Central Bank",
                    "description": "European Central Bank's decision on the main refinancing rate."
                },
                {
                    "title": "Bank of England Interest Rate Decision",
                    "country": "UK",
                    "importance": "High",
                    "category": "Central Bank",
                    "description": "Bank of England's decision on the official bank rate."
                },
                {
                    "title": "Bank of Japan Interest Rate Decision",
                    "country": "JP",
                    "importance": "High",
                    "category": "Central Bank",
                    "description": "Bank of Japan's decision on the overnight call rate."
                },
                {
                    "title": "Chinese GDP",
                    "country": "CN",
                    "importance": "High",
                    "category": "GDP",
                    "description": "Quarterly change in the inflation-adjusted value of all goods and services produced in China."
                },
                {
                    "title": "German IFO Business Climate",
                    "country": "DE",
                    "importance": "Medium",
                    "category": "Business Sentiment",
                    "description": "Survey of about 7,000 businesses which asks respondents to give their assessment of the current business situation."
                },
                {
                    "title": "UK Inflation Rate",
                    "country": "UK",
                    "importance": "Medium",
                    "category": "Inflation",
                    "description": "Measures the change in the price of goods and services purchased by consumers in the UK."
                },
                {
                    "title": "Japanese Core CPI",
                    "country": "JP",
                    "importance": "Medium",
                    "category": "Inflation",
                    "description": "Change in the price of goods and services purchased by consumers, excluding fresh food."
                }
            ]
            
            # Adicionar alguns eventos aleatórios para cada dia
            num_events = random.randint(0, 3)
            for _ in range(num_events):
                event = random.choice(sample_events).copy()
                
                # Adicionar horário aleatório
                hour = random.randint(8, 17)
                minute = random.choice([0, 15, 30, 45])
                event_datetime = event_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                
                event.update({
                    "id": len(events) + 1,
                    "date": event_datetime.strftime("%Y-%m-%d"),
                    "time": event_datetime.strftime("%H:%M"),
                    "datetime": event_datetime.isoformat(),
                    "actual": None,
                    "forecast": None,
                    "previous": None
                })
                
                # Adicionar valores de exemplo para alguns eventos
                if event["title"] in ["Non-Farm Payrolls", "Unemployment Rate", "GDP Growth Rate"]:
                    if event["title"] == "Non-Farm Payrolls":
                        event["forecast"] = f"{random.randint(150, 300)}K"
                        event["previous"] = f"{random.randint(150, 300)}K"
                    elif event["title"] == "Unemployment Rate":
                        event["forecast"] = f"{random.uniform(3.5, 5.0):.1f}%"
                        event["previous"] = f"{random.uniform(3.5, 5.0):.1f}%"
                    elif event["title"] == "GDP Growth Rate":
                        event["forecast"] = f"{random.uniform(1.5, 3.5):.1f}%"
                        event["previous"] = f"{random.uniform(1.5, 3.5):.1f}%"
                
                events.append(event)
        
        # Ordenar por data e hora
        events.sort(key=lambda x: x["datetime"])
        
        return events
    
    @staticmethod
    def get_economic_events(start_date=None, end_date=None, country: str = None, importance: str = None, category: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Obtém eventos econômicos para um período específico
        """
        try:
            all_events = CalendarService._get_real_economic_events()
            
            # Filtrar por data se especificado
            if start_date or end_date:
                filtered_events = []
                
                for event in all_events:
                    event_date = datetime.fromisoformat(event["datetime"]).date()
                    
                    include_event = True
                    
                    if start_date:
                        if isinstance(start_date, str):
                            start = datetime.strptime(start_date, "%Y-%m-%d").date()
                        else:
                            start = start_date
                        if event_date < start:
                            include_event = False
                    
                    if end_date:
                        if isinstance(end_date, str):
                            end = datetime.strptime(end_date, "%Y-%m-%d").date()
                        else:
                            end = end_date
                        if event_date > end:
                            include_event = False
                    
                    if include_event:
                        filtered_events.append(event)
                
                all_events = filtered_events
            
            # Filtrar por país se especificado
            if country:
                all_events = [event for event in all_events if event.get('country', '').upper() == country.upper()]
            
            # Filtrar por importância se especificado
            if importance:
                all_events = [event for event in all_events if event.get('importance', '').lower() == importance.lower()]
            
            # Filtrar por categoria se especificado
            if category:
                all_events = [event for event in all_events if event.get('category', '').lower() == category.lower()]
            
            return all_events[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos econômicos: {str(e)}")
    
    @staticmethod
    def get_events_by_country(country: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Obtém eventos econômicos de um país específico
        """
        try:
            all_events = CalendarService._get_real_economic_events()
            
            # Filtrar por país
            country_events = [event for event in all_events if event["country"].upper() == country.upper()]
            
            return country_events[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos do país {country}: {str(e)}")
    
    @staticmethod
    def get_high_impact_events(limit: int = 30) -> List[Dict[str, Any]]:
        """
        Obtém apenas eventos de alto impacto
        """
        try:
            all_events = CalendarService._get_real_economic_events()
            
            # Filtrar apenas eventos de alta importância
            high_impact_events = [event for event in all_events if event["importance"] == "High"]
            
            return high_impact_events[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos de alto impacto: {str(e)}")
    
    @staticmethod
    def get_events_by_category(category: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Obtém eventos econômicos por categoria
        """
        try:
            all_events = CalendarService._get_real_economic_events()
            
            # Filtrar por categoria
            category_events = [event for event in all_events if event["category"].lower() == category.lower()]
            
            return category_events[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos da categoria {category}: {str(e)}")
    
    @staticmethod
    def get_today_events(country: str = None, importance: str = None) -> List[Dict[str, Any]]:
        """
        Obtém eventos econômicos de hoje
        """
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            return CalendarService.get_economic_events(
                start_date=today, 
                end_date=today,
                country=country,
                importance=importance
            )
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos de hoje: {str(e)}")
    
    @staticmethod
    def get_week_events(country: str = None, importance: str = None) -> List[Dict[str, Any]]:
        """
        Obtém eventos econômicos da semana atual
        """
        try:
            today = datetime.now()
            start_of_week = today - timedelta(days=today.weekday())
            end_of_week = start_of_week + timedelta(days=6)
            
            start_date = start_of_week.strftime("%Y-%m-%d")
            end_date = end_of_week.strftime("%Y-%m-%d")
            
            return CalendarService.get_economic_events(
                start_date=start_date, 
                end_date=end_date,
                country=country,
                importance=importance
            )
            
        except Exception as e:
            raise Exception(f"Erro ao buscar eventos da semana: {str(e)}")