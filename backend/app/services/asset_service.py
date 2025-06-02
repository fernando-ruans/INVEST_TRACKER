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
            # Lista expandida de símbolos populares incluindo ativos brasileiros
            popular_symbols = [
                # Ações americanas populares
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
                {"symbol": "DIS", "name": "Walt Disney Company", "exchange": "NYSE"},
                
                # Ações brasileiras - Bancos
                {"symbol": "ITUB4.SA", "name": "Itaú Unibanco Holding S.A.", "exchange": "B3"},
                {"symbol": "BBDC4.SA", "name": "Banco Bradesco S.A.", "exchange": "B3"},
                {"symbol": "BBAS3.SA", "name": "Banco do Brasil S.A.", "exchange": "B3"},
                {"symbol": "SANB11.SA", "name": "Banco Santander Brasil S.A.", "exchange": "B3"},
                {"symbol": "BPAC11.SA", "name": "BTG Pactual S.A.", "exchange": "B3"},
                
                # Ações brasileiras - Petróleo e Energia
                {"symbol": "PETR4.SA", "name": "Petróleo Brasileiro S.A. - Petrobras", "exchange": "B3"},
                {"symbol": "PETR3.SA", "name": "Petróleo Brasileiro S.A. - Petrobras ON", "exchange": "B3"},
                {"symbol": "VALE3.SA", "name": "Vale S.A.", "exchange": "B3"},
                {"symbol": "ELET3.SA", "name": "Centrais Elétricas Brasileiras S.A. - Eletrobras", "exchange": "B3"},
                {"symbol": "ELET6.SA", "name": "Centrais Elétricas Brasileiras S.A. - Eletrobras PNB", "exchange": "B3"},
                
                # Ações brasileiras - Varejo e Consumo
                {"symbol": "MGLU3.SA", "name": "Magazine Luiza S.A.", "exchange": "B3"},
                {"symbol": "LREN3.SA", "name": "Lojas Renner S.A.", "exchange": "B3"},
                {"symbol": "ABEV3.SA", "name": "Ambev S.A.", "exchange": "B3"},
                {"symbol": "JBSS3.SA", "name": "JBS S.A.", "exchange": "B3"},
                {"symbol": "BRFS3.SA", "name": "BRF S.A.", "exchange": "B3"},
                
                # Ações brasileiras - Tecnologia e Telecom
                {"symbol": "VIVT3.SA", "name": "Telefônica Brasil S.A.", "exchange": "B3"},
                {"symbol": "TIMS3.SA", "name": "TIM S.A.", "exchange": "B3"},
                {"symbol": "WEGE3.SA", "name": "WEG S.A.", "exchange": "B3"},
                {"symbol": "TOTS3.SA", "name": "TOTVS S.A.", "exchange": "B3"},
                
                # Ações brasileiras - Siderurgia e Mineração
                {"symbol": "USIM5.SA", "name": "Usinas Siderúrgicas de Minas Gerais S.A.", "exchange": "B3"},
                {"symbol": "CSNA3.SA", "name": "Companhia Siderúrgica Nacional", "exchange": "B3"},
                {"symbol": "GOAU4.SA", "name": "Metalúrgica Gerdau S.A.", "exchange": "B3"},
                
                # ETFs brasileiros
                {"symbol": "BOVA11.SA", "name": "iShares Ibovespa Fundo de Índice", "exchange": "B3"},
                {"symbol": "SMAL11.SA", "name": "iShares BM&F Bovespa Small Cap Fundo de Índice", "exchange": "B3"},
                {"symbol": "IVVB11.SA", "name": "iShares Core S&P 500 Fundo de Índice", "exchange": "B3"},
                {"symbol": "SPXI11.SA", "name": "SPDR S&P 500 ETF Trust", "exchange": "B3"},
                
                # FIIs populares
                 {"symbol": "HGLG11.SA", "name": "CSHG Logística FII", "exchange": "B3"},
                 {"symbol": "XPML11.SA", "name": "XP Malls FII", "exchange": "B3"},
                 {"symbol": "KNRI11.SA", "name": "Kinea Renda Imobiliária FII", "exchange": "B3"},
                 {"symbol": "BCFF11.SA", "name": "BTG Pactual Fundo de FIIs", "exchange": "B3"},
                 {"symbol": "MXRF11.SA", "name": "Maxi Renda FII", "exchange": "B3"},
                 {"symbol": "VISC11.SA", "name": "Vinci Shopping Centers FII", "exchange": "B3"},
                 {"symbol": "XPLG11.SA", "name": "XP Log FII", "exchange": "B3"},
                 {"symbol": "HGRE11.SA", "name": "CSHG Real Estate FII", "exchange": "B3"},
                 {"symbol": "KNCR11.SA", "name": "Kinea Rendimentos Imobiliários FII", "exchange": "B3"},
                 {"symbol": "BTLG11.SA", "name": "BTG Pactual Logística FII", "exchange": "B3"},
                 
                 # Criptomoedas principais
                 {"symbol": "BTC-USD", "name": "Bitcoin", "exchange": "Crypto"},
                 {"symbol": "ETH-USD", "name": "Ethereum", "exchange": "Crypto"},
                 {"symbol": "BNB-USD", "name": "Binance Coin", "exchange": "Crypto"},
                 {"symbol": "ADA-USD", "name": "Cardano", "exchange": "Crypto"},
                 {"symbol": "SOL-USD", "name": "Solana", "exchange": "Crypto"},
                 {"symbol": "XRP-USD", "name": "Ripple", "exchange": "Crypto"},
                 {"symbol": "DOT-USD", "name": "Polkadot", "exchange": "Crypto"},
                 {"symbol": "DOGE-USD", "name": "Dogecoin", "exchange": "Crypto"},
                 {"symbol": "AVAX-USD", "name": "Avalanche", "exchange": "Crypto"},
                 {"symbol": "MATIC-USD", "name": "Polygon", "exchange": "Crypto"},
                 
                 # Commodities
                 # Metais Preciosos
                 {"symbol": "GC=F", "name": "Ouro (Gold Futures)", "exchange": "COMEX"},
                 {"symbol": "SI=F", "name": "Prata (Silver Futures)", "exchange": "COMEX"},
                 {"symbol": "PL=F", "name": "Platina (Platinum Futures)", "exchange": "NYMEX"},
                 {"symbol": "PA=F", "name": "Paládio (Palladium Futures)", "exchange": "NYMEX"},
                 
                 # Energia
                 {"symbol": "CL=F", "name": "Petróleo Bruto WTI", "exchange": "NYMEX"},
                 {"symbol": "BZ=F", "name": "Petróleo Brent", "exchange": "ICE"},
                 {"symbol": "NG=F", "name": "Gás Natural", "exchange": "NYMEX"},
                 
                 # Metais Industriais
                 {"symbol": "HG=F", "name": "Cobre", "exchange": "COMEX"},
                 
                 # Agricultura
                 {"symbol": "ZC=F", "name": "Milho", "exchange": "CBOT"},
                 {"symbol": "ZS=F", "name": "Soja", "exchange": "CBOT"},
                 {"symbol": "ZW=F", "name": "Trigo", "exchange": "CBOT"},
                 {"symbol": "KC=F", "name": "Café", "exchange": "ICE"},
                 {"symbol": "SB=F", "name": "Açúcar", "exchange": "ICE"},
                 {"symbol": "CC=F", "name": "Cacau", "exchange": "ICE"},
                 {"symbol": "CT=F", "name": "Algodão", "exchange": "ICE"},
                 {"symbol": "OJ=F", "name": "Suco de Laranja", "exchange": "ICE"},
                 
                 # Outros
                 {"symbol": "LBS=F", "name": "Madeira (Lumber)", "exchange": "CME"},
                 
                 # Moedas (Forex)
                 {"symbol": "EURUSD=X", "name": "Euro/Dólar Americano", "exchange": "Forex"},
                 {"symbol": "GBPUSD=X", "name": "Libra/Dólar Americano", "exchange": "Forex"},
                 {"symbol": "USDJPY=X", "name": "Dólar Americano/Iene Japonês", "exchange": "Forex"},
                 {"symbol": "USDCAD=X", "name": "Dólar Americano/Dólar Canadense", "exchange": "Forex"},
                 {"symbol": "AUDUSD=X", "name": "Dólar Australiano/Dólar Americano", "exchange": "Forex"},
                 {"symbol": "USDBRL=X", "name": "Dólar Americano/Real Brasileiro", "exchange": "Forex"},
                 {"symbol": "EURBRL=X", "name": "Euro/Real Brasileiro", "exchange": "Forex"},
                 
                 # Índices Internacionais
                 {"symbol": "^GSPC", "name": "S&P 500", "exchange": "NYSE"},
                 {"symbol": "^DJI", "name": "Dow Jones Industrial Average", "exchange": "NYSE"},
                 {"symbol": "^IXIC", "name": "NASDAQ Composite", "exchange": "NASDAQ"},
                 {"symbol": "^FTSE", "name": "FTSE 100", "exchange": "LSE"},
                 {"symbol": "^GDAXI", "name": "DAX", "exchange": "XETRA"},
                 {"symbol": "^N225", "name": "Nikkei 225", "exchange": "TSE"},
                 {"symbol": "^HSI", "name": "Hang Seng Index", "exchange": "HKEX"},
                 
                 # Títulos e Bonds
                 {"symbol": "^TNX", "name": "Treasury Yield 10 Years", "exchange": "CBOE"},
                 {"symbol": "^FVX", "name": "Treasury Yield 5 Years", "exchange": "CBOE"},
                 {"symbol": "^IRX", "name": "Treasury Bill 3 Month", "exchange": "CBOE"},
                 
                 # Forex Adicional
                 {"symbol": "USDCHF=X", "name": "Dólar Americano/Franco Suíço", "exchange": "Forex"},
                 {"symbol": "USDJPY=X", "name": "Dólar Americano/Iene Japonês", "exchange": "Forex"},
                 {"symbol": "NZDUSD=X", "name": "Dólar Neozelandês/Dólar Americano", "exchange": "Forex"},
                 {"symbol": "EURJPY=X", "name": "Euro/Iene Japonês", "exchange": "Forex"},
                 {"symbol": "GBPJPY=X", "name": "Libra/Iene Japonês", "exchange": "Forex"},
                 {"symbol": "EURGBP=X", "name": "Euro/Libra", "exchange": "Forex"},
                 
                 # Futuros BMF (B3)
                 {"symbol": "WDO=F", "name": "Mini Dólar Futuro", "exchange": "BMF"},
                 {"symbol": "DOL=F", "name": "Dólar Futuro", "exchange": "BMF"},
                 {"symbol": "WIN=F", "name": "Mini Índice Futuro", "exchange": "BMF"},
                 {"symbol": "IND=F", "name": "Índice Futuro", "exchange": "BMF"},
                 {"symbol": "BGI=F", "name": "Boi Gordo Futuro", "exchange": "BMF"},
                 {"symbol": "CCM=F", "name": "Milho Futuro", "exchange": "BMF"},
                 {"symbol": "ICF=F", "name": "Café Arábica Futuro", "exchange": "BMF"},
                 {"symbol": "DI1=F", "name": "DI Futuro", "exchange": "BMF"}
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
                "SMAL11.SA": "Small Cap",
                "DIVO11.SA": "Dividendos"
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