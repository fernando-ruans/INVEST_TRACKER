import yfinance as yf
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd

class AssetService:
    @staticmethod
    def get_asset_info(symbol: str) -> Dict[str, Any]:
        """
        Obtém informações detalhadas de um ativo financeiro
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Dados básicos do ativo
            asset_data = {
                "symbol": symbol.upper(),
                "name": info.get("longName", info.get("shortName", symbol)),
                "current_price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
                "previous_close": info.get("previousClose", 0),
                "open_price": info.get("open", info.get("regularMarketOpen", 0)),
                "day_high": info.get("dayHigh", info.get("regularMarketDayHigh", 0)),
                "day_low": info.get("dayLow", info.get("regularMarketDayLow", 0)),
                "volume": info.get("volume", info.get("regularMarketVolume", 0)),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0),
                "currency": info.get("currency", "USD"),
                "exchange": info.get("exchange", ""),
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
                "description": info.get("longBusinessSummary", ""),
                "website": info.get("website", ""),
                "employees": info.get("fullTimeEmployees", 0)
            }
            
            # Calcular mudança percentual
            if asset_data["previous_close"] and asset_data["current_price"]:
                change = asset_data["current_price"] - asset_data["previous_close"]
                change_percent = (change / asset_data["previous_close"]) * 100
                asset_data["change"] = change
                asset_data["change_percent"] = change_percent
            else:
                asset_data["change"] = 0
                asset_data["change_percent"] = 0
                
            return asset_data
            
        except Exception as e:
            raise Exception(f"Erro ao buscar informações do ativo {symbol}: {str(e)}")
    
    @staticmethod
    def get_historical_data(symbol: str, period: str = "1y", interval: str = "1d") -> List[Dict[str, Any]]:
        """
        Obtém dados históricos de um ativo
        """
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                return []
            
            # Converter para lista de dicionários
            historical_data = []
            for date, row in hist.iterrows():
                historical_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]) if pd.notna(row["Volume"]) else 0
                })
            
            return historical_data
            
        except Exception as e:
            raise Exception(f"Erro ao buscar dados históricos do ativo {symbol}: {str(e)}")
    
    @staticmethod
    def search_assets(query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Busca ativos por nome ou símbolo
        """
        try:
            # Lista de símbolos populares para demonstração
            popular_symbols = [
                {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
                {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
                {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
                {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
                {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
                {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
                {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
                {"symbol": "NFLX", "name": "Netflix Inc.", "exchange": "NASDAQ"},
                {"symbol": "BABA", "name": "Alibaba Group Holding Limited", "exchange": "NYSE"},
                {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
                {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
                {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE"},
                {"symbol": "WMT", "name": "Walmart Inc.", "exchange": "NYSE"},
                {"symbol": "PG", "name": "Procter & Gamble Company", "exchange": "NYSE"},
                {"symbol": "UNH", "name": "UnitedHealth Group Incorporated", "exchange": "NYSE"},
                {"symbol": "HD", "name": "Home Depot Inc.", "exchange": "NYSE"},
                {"symbol": "MA", "name": "Mastercard Incorporated", "exchange": "NYSE"},
                {"symbol": "BAC", "name": "Bank of America Corporation", "exchange": "NYSE"},
                {"symbol": "XOM", "name": "Exxon Mobil Corporation", "exchange": "NYSE"},
                {"symbol": "DIS", "name": "Walt Disney Company", "exchange": "NYSE"}
            ]
            
            # Filtrar por query
            query_lower = query.lower()
            results = []
            
            for asset in popular_symbols:
                if (query_lower in asset["symbol"].lower() or 
                    query_lower in asset["name"].lower()):
                    results.append(asset)
                    
                if len(results) >= limit:
                    break
            
            return results
            
        except Exception as e:
            raise Exception(f"Erro ao buscar ativos: {str(e)}")
    
    @staticmethod
    def get_market_overview() -> Dict[str, Any]:
        """
        Obtém visão geral do mercado com principais índices brasileiros
        """
        try:
            # Índices brasileiros principais
            indices = {
                "^BVSP": "Ibovespa",
                "IFIX.SA": "IFIX",
                "SMLL11.SA": "Small Cap",
                "IDIV11.SA": "Dividendos"
            }
            
            indices_data = []
            
            for symbol, name in indices.items():
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="2d")
                    
                    if not hist.empty:
                        current_price = float(hist["Close"].iloc[-1])
                        previous_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current_price
                        
                        change = current_price - previous_close
                        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
                        
                        # Converter símbolo para formato usado no frontend
                        display_symbol = symbol.replace(".SA", "").replace("^BVSP", "IBOVESPA")
                        
                        indices_data.append({
                            "symbol": display_symbol,
                            "name": name,
                            "price": current_price,
                            "change": change,
                            "changePercent": change_percent
                        })
                    else:
                        # Fallback com dados zerados se não conseguir buscar
                        display_symbol = symbol.replace(".SA", "").replace("^BVSP", "IBOVESPA")
                        indices_data.append({
                            "symbol": display_symbol,
                            "name": name,
                            "price": 0,
                            "change": 0,
                            "changePercent": 0
                        })
                except Exception as e:
                    # Se falhar para um índice específico, adiciona com dados zerados
                    display_symbol = symbol.replace(".SA", "").replace("^BVSP", "IBOVESPA")
                    indices_data.append({
                        "symbol": display_symbol,
                        "name": name,
                        "price": 0,
                        "change": 0,
                        "changePercent": 0
                    })
                    continue
            
            # Retornar no formato esperado pelo frontend
            return {
                "indices": indices_data,
                "summary": {
                    "totalMarketCap": 0,
                    "tradingVolume": 0,
                    "advancingStocks": 0,
                    "decliningStocks": 0
                }
            }
            
        except Exception as e:
            # Fallback completo em caso de erro
            return {
                "indices": [
                    {"symbol": "IBOVESPA", "name": "Ibovespa", "price": 0, "change": 0, "changePercent": 0},
                    {"symbol": "IFIX", "name": "IFIX", "price": 0, "change": 0, "changePercent": 0},
                    {"symbol": "SMLL11", "name": "Small Cap", "price": 0, "change": 0, "changePercent": 0},
                    {"symbol": "IDIV11", "name": "Dividendos", "price": 0, "change": 0, "changePercent": 0}
                ],
                "summary": {
                    "totalMarketCap": 0,
                    "tradingVolume": 0,
                    "advancingStocks": 0,
                    "decliningStocks": 0
                }
            }
    
    @staticmethod
    def get_multiple_assets(symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Obtém informações de múltiplos ativos de uma vez
        """
        try:
            results = {}
            
            for symbol in symbols:
                try:
                    asset_info = AssetService.get_asset_info(symbol)
                    results[symbol] = asset_info
                except Exception as e:
                    # Se falhar para um ativo específico, continua com os outros
                    results[symbol] = {"error": str(e)}
            
            return results
            
        except Exception as e:
            raise Exception(f"Erro ao buscar múltiplos ativos: {str(e)}")