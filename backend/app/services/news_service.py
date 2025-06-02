import feedparser
import requests
from typing import List, Dict, Any
from datetime import datetime, timedelta
import re
from html import unescape
import time

class NewsService:
    # Cache simples para evitar muitas requisições
    _cache = {}
    _cache_duration = 300  # 5 minutos
    
    # URLs dos feeds RSS
    RSS_FEEDS = {
        "yahoo_finance": "https://feeds.finance.yahoo.com/rss/2.0/headline",
        "investing_com": "https://www.investing.com/rss/news.rss",
        "marketwatch": "https://feeds.marketwatch.com/marketwatch/topstories/",
        "reuters_business": "https://feeds.reuters.com/reuters/businessNews",
        "cnbc": "https://www.cnbc.com/id/100003114/device/rss/rss.html"
    }
    
    @staticmethod
    def _clean_html(text: str) -> str:
        """
        Remove tags HTML e limpa o texto
        """
        if not text:
            return ""
        
        # Remove tags HTML
        clean = re.compile('<.*?>')
        text = re.sub(clean, '', text)
        
        # Decodifica entidades HTML
        text = unescape(text)
        
        # Remove quebras de linha excessivas
        text = re.sub(r'\n+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    @staticmethod
    def _categorize_news(title: str, description: str) -> str:
        """
        Categoriza a notícia baseado no título e descrição
        """
        content = f"{title} {description}".lower()
        
        # Palavras-chave para cada categoria com pesos
        categories = {
            "stocks": {
                "keywords": ["stock", "shares", "equity", "ipo", "earnings", "dividend", "market cap", "nasdaq", "nyse", "s&p", "dow jones", "wall street", "trading", "investor", "shareholder", "quarterly", "revenue", "profit", "loss", "analyst", "upgrade", "downgrade"],
                "weight": 1
            },
            "crypto": {
                "keywords": ["bitcoin", "ethereum", "crypto", "cryptocurrency", "blockchain", "defi", "nft", "binance", "coinbase", "altcoin", "mining", "btc", "eth", "digital currency", "token", "wallet", "exchange"],
                "weight": 2
            },
            "forex": {
                "keywords": ["forex", "currency", "dollar", "euro", "yen", "pound", "exchange rate", "fed", "federal reserve", "central bank", "interest rate", "monetary policy", "inflation", "usd", "eur", "gbp", "jpy"],
                "weight": 2
            },
            "commodities": {
                "keywords": ["gold", "silver", "oil", "crude", "copper", "wheat", "corn", "natural gas", "commodity", "futures", "brent", "wti", "precious metals", "agriculture", "energy"],
                "weight": 2
            },
            "economy": {
                "keywords": ["gdp", "unemployment", "inflation", "recession", "economic growth", "trade war", "tariff", "export", "import", "manufacturing", "factory", "industrial", "economic data", "consumer", "retail"],
                "weight": 1
            }
        }
        
        # Contar matches para cada categoria com pesos
        category_scores = {}
        for category, data in categories.items():
            keywords = data["keywords"]
            weight = data["weight"]
            score = sum(weight for keyword in keywords if keyword in content)
            if score > 0:
                category_scores[category] = score
        
        # Retornar a categoria com maior score, ou 'financial' como padrão
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return "financial"
    
    @staticmethod
    def _is_cache_valid(cache_key: str) -> bool:
        """
        Verifica se o cache ainda é válido
        """
        if cache_key not in NewsService._cache:
            return False
        
        cache_time = NewsService._cache[cache_key].get('timestamp', 0)
        return time.time() - cache_time < NewsService._cache_duration
    
    @staticmethod
    def _get_from_cache(cache_key: str) -> List[Dict[str, Any]]:
        """
        Obtém dados do cache
        """
        if NewsService._is_cache_valid(cache_key):
            return NewsService._cache[cache_key]['data']
        return []
    
    @staticmethod
    def _set_cache(cache_key: str, data: List[Dict[str, Any]]) -> None:
        """
        Armazena dados no cache
        """
        NewsService._cache[cache_key] = {
            'data': data,
            'timestamp': time.time()
        }
    
    @staticmethod
    def _parse_feed(feed_url: str, source: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Faz parse de um feed RSS
        """
        try:
            # Verificar cache primeiro
            cache_key = f"{source}_{limit}"
            cached_data = NewsService._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            # Buscar feed
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(feed_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            news_items = []
            
            for entry in feed.entries[:limit]:
                # Extrair data
                published_date = datetime.now()
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_date = datetime(*entry.published_parsed[:6])
                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    published_date = datetime(*entry.updated_parsed[:6])
                
                # Extrair descrição
                description = ""
                if hasattr(entry, 'summary'):
                    description = NewsService._clean_html(entry.summary)
                elif hasattr(entry, 'description'):
                    description = NewsService._clean_html(entry.description)
                
                # Limitar tamanho da descrição
                if len(description) > 300:
                    description = description[:297] + "..."
                
                # Categorizar baseado no conteúdo
                category = NewsService._categorize_news(entry.title, description)
                
                news_item = {
                    "title": NewsService._clean_html(entry.title) if hasattr(entry, 'title') else "Sem título",
                    "description": description,
                    "url": entry.link if hasattr(entry, 'link') else "",
                    "published_at": published_date.isoformat(),
                    "source": source,
                    "category": category
                }
                
                news_items.append(news_item)
            
            # Armazenar no cache
            NewsService._set_cache(cache_key, news_items)
            
            return news_items
            
        except Exception as e:
            print(f"Erro ao buscar notícias de {source}: {str(e)}")
            return []
    
    @staticmethod
    def get_financial_news(limit: int = 50) -> List[Dict[str, Any]]:
        """
        Obtém notícias financeiras gerais de múltiplas fontes
        """
        try:
            all_news = []
            
            # Buscar de múltiplas fontes
            for source, feed_url in NewsService.RSS_FEEDS.items():
                try:
                    source_news = NewsService._parse_feed(feed_url, source, limit // len(NewsService.RSS_FEEDS) + 5)
                    all_news.extend(source_news)
                except Exception as e:
                    print(f"Erro ao buscar notícias de {source}: {str(e)}")
                    continue
            
            # Ordenar por data (mais recentes primeiro)
            all_news.sort(key=lambda x: x['published_at'], reverse=True)
            
            # Remover duplicatas baseado no título
            seen_titles = set()
            unique_news = []
            
            for news in all_news:
                title_lower = news['title'].lower()
                if title_lower not in seen_titles:
                    seen_titles.add(title_lower)
                    unique_news.append(news)
                    
                if len(unique_news) >= limit:
                    break
            
            return unique_news[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar notícias financeiras: {str(e)}")
    
    @staticmethod
    def get_asset_news(symbol: str, limit: int = 30) -> List[Dict[str, Any]]:
        """
        Obtém notícias específicas de um ativo
        """
        try:
            # Para demonstração, vamos filtrar notícias gerais que mencionam o símbolo
            # Em uma implementação real, você usaria APIs específicas como Alpha Vantage, Polygon, etc.
            
            cache_key = f"asset_{symbol}_{limit}"
            cached_data = NewsService._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            # Buscar notícias gerais
            general_news = NewsService.get_financial_news(100)
            
            # Filtrar notícias que mencionam o símbolo
            symbol_upper = symbol.upper()
            symbol_lower = symbol.lower()
            
            # Mapear símbolos para nomes de empresas conhecidas
            symbol_names = {
                "AAPL": ["Apple", "iPhone", "iPad", "Mac"],
                "GOOGL": ["Google", "Alphabet", "YouTube", "Android"],
                "MSFT": ["Microsoft", "Windows", "Office", "Azure"],
                "AMZN": ["Amazon", "AWS", "Prime", "Alexa"],
                "TSLA": ["Tesla", "Elon Musk", "Model", "Electric Vehicle"],
                "META": ["Meta", "Facebook", "Instagram", "WhatsApp"],
                "NVDA": ["NVIDIA", "GPU", "AI chip", "graphics"],
                "NFLX": ["Netflix", "streaming", "subscriber"],
                "BABA": ["Alibaba", "Jack Ma", "China e-commerce"],
                "V": ["Visa", "payment", "credit card"]
            }
            
            search_terms = [symbol_upper, symbol_lower]
            if symbol_upper in symbol_names:
                search_terms.extend([term.lower() for term in symbol_names[symbol_upper]])
            
            filtered_news = []
            
            for news in general_news:
                title_lower = news['title'].lower()
                description_lower = news['description'].lower()
                
                # Verificar se algum termo de busca está presente
                for term in search_terms:
                    if (term.lower() in title_lower or term.lower() in description_lower):
                        # Adicionar informação do símbolo
                        news_copy = news.copy()
                        news_copy['related_symbol'] = symbol_upper
                        filtered_news.append(news_copy)
                        break
                
                if len(filtered_news) >= limit:
                    break
            
            # Se não encontrou notícias específicas, gerar algumas de exemplo
            if not filtered_news:
                example_news = [
                    {
                        "title": f"{symbol_upper} Stock Analysis: Market Performance Update",
                        "description": f"Latest analysis and market performance data for {symbol_upper} stock, including price movements and trading volume.",
                        "url": f"https://example.com/news/{symbol_lower}-analysis",
                        "published_at": datetime.now().isoformat(),
                        "source": "Market Analysis",
                        "category": "financial",
                        "related_symbol": symbol_upper
                    },
                    {
                        "title": f"{symbol_upper} Quarterly Earnings Preview",
                        "description": f"Preview of upcoming quarterly earnings for {symbol_upper}, including analyst expectations and key metrics to watch.",
                        "url": f"https://example.com/news/{symbol_lower}-earnings",
                        "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                        "source": "Earnings Preview",
                        "category": "financial",
                        "related_symbol": symbol_upper
                    }
                ]
                filtered_news = example_news
            
            # Armazenar no cache
            NewsService._set_cache(cache_key, filtered_news)
            
            return filtered_news[:limit]
            
        except Exception as e:
            raise Exception(f"Erro ao buscar notícias do ativo {symbol}: {str(e)}")
    
    @staticmethod
    def get_market_news_by_category(category: str, limit: int = 30) -> List[Dict[str, Any]]:
        """
        Obtém notícias por categoria (stocks, crypto, forex, etc.)
        """
        try:
            # Para demonstração, retorna notícias gerais com categoria específica
            news = NewsService.get_financial_news(limit)
            
            # Adicionar categoria específica
            for item in news:
                item['category'] = category
            
            return news
            
        except Exception as e:
            raise Exception(f"Erro ao buscar notícias da categoria {category}: {str(e)}")