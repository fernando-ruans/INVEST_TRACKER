import feedparser
import requests
from typing import List, Dict, Any
from datetime import datetime, timedelta
import re
from html import unescape
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

class NewsService:
    # Cache simples para evitar muitas requisições
    _cache = {}
    _cache_duration = 300  # 5 minutos
    
    # URLs dos feeds RSS - reduzido para fontes mais confiáveis
    RSS_FEEDS = {
        # Fontes Brasileiras mais confiáveis
        "infomoney": "https://www.infomoney.com.br/feed/",
        "valor_economico": "https://valor.globo.com/rss/home/",
        "exame": "https://exame.com/feed/",
        "g1_economia": "http://g1.globo.com/dynamo/economia/rss2.xml",
        "money_times": "https://www.moneytimes.com.br/feed/",
        
        # Fontes Internacionais confiáveis
        "yahoo_finance": "https://feeds.finance.yahoo.com/rss/2.0/headline",
        "reuters_business": "https://feeds.reuters.com/reuters/businessNews",
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
        
        # Remove espaços excessivos
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    @staticmethod
    def _categorize_news(title: str, description: str) -> str:
        """
        Categoriza a notícia baseado no título e descrição
        """
        content = f"{title} {description}".lower()
        
        # Palavras-chave simplificadas para categorização mais rápida
        if any(keyword in content for keyword in ["ação", "ações", "bolsa", "bovespa", "ibovespa", "stock", "shares"]):
            return "stocks"
        elif any(keyword in content for keyword in ["bitcoin", "crypto", "criptomoeda", "ethereum"]):
            return "crypto"
        elif any(keyword in content for keyword in ["dólar", "câmbio", "forex", "currency"]):
            return "forex"
        elif any(keyword in content for keyword in ["petróleo", "ouro", "commodity", "soja", "minério"]):
            return "commodities"
        else:
            return "economy"
    
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
    def _parse_feed_fast(feed_url: str, source: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Faz parse de um feed RSS com timeout reduzido
        """
        try:
            # Buscar feed com timeout reduzido
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(feed_url, headers=headers, timeout=3)  # Timeout reduzido para 3s
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            news_items = []
            
            for entry in feed.entries[:limit]:
                # Extrair data
                published_date = datetime.now()
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    try:
                        published_date = datetime(*entry.published_parsed[:6])
                    except:
                        pass
                
                # Extrair descrição
                description = ""
                if hasattr(entry, 'summary'):
                    description = NewsService._clean_html(entry.summary)
                elif hasattr(entry, 'description'):
                    description = NewsService._clean_html(entry.description)
                
                # Limitar tamanho da descrição
                if len(description) > 200:
                    description = description[:197] + "..."
                
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
            
            return news_items
            
        except Exception as e:
            print(f"Erro ao buscar notícias de {source}: {str(e)}")
            return []
    
    @staticmethod
    def get_financial_news(limit: int = 50) -> List[Dict[str, Any]]:
        """
        Obtém notícias financeiras gerais de múltiplas fontes com processamento paralelo
        """
        try:
            # Verificar cache primeiro
            cache_key = f"financial_news_{limit}"
            cached_data = NewsService._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            all_news = []
            
            # Usar ThreadPoolExecutor para buscar feeds em paralelo
            with ThreadPoolExecutor(max_workers=4) as executor:
                # Submeter todas as tarefas
                future_to_source = {
                    executor.submit(NewsService._parse_feed_fast, feed_url, source, 8): source 
                    for source, feed_url in NewsService.RSS_FEEDS.items()
                }
                
                # Coletar resultados com timeout
                for future in as_completed(future_to_source, timeout=8):  # Timeout total de 8s
                    try:
                        source_news = future.result(timeout=1)  # Timeout individual de 1s
                        all_news.extend(source_news)
                    except Exception as e:
                        source = future_to_source[future]
                        print(f"Erro ao processar {source}: {str(e)}")
                        continue
            
            # Se não conseguiu nenhuma notícia, retornar dados de fallback
            if not all_news:
                fallback_news = [
                    {
                        "title": "Mercado Financeiro em Análise",
                        "description": "Acompanhe as principais movimentações do mercado financeiro brasileiro e internacional.",
                        "url": "#",
                        "published_at": datetime.now().isoformat(),
                        "source": "sistema",
                        "category": "economy"
                    },
                    {
                        "title": "Índices em Movimento",
                        "description": "Bovespa e principais índices internacionais apresentam volatilidade.",
                        "url": "#",
                        "published_at": datetime.now().isoformat(),
                        "source": "sistema",
                        "category": "stocks"
                    }
                ]
                NewsService._set_cache(cache_key, fallback_news)
                return fallback_news
            
            # Ordenar por data (mais recentes primeiro)
            all_news.sort(key=lambda x: x['published_at'], reverse=True)
            
            # Remover duplicatas baseado no título
            seen_titles = set()
            unique_news = []
            
            for news in all_news:
                title_lower = news['title'].lower()
                if title_lower not in seen_titles and len(title_lower) > 10:  # Filtrar títulos muito curtos
                    seen_titles.add(title_lower)
                    unique_news.append(news)
                    
                if len(unique_news) >= limit:
                    break
            
            result = unique_news[:limit]
            NewsService._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            print(f"Erro geral ao buscar notícias: {str(e)}")
            # Retornar dados de fallback em caso de erro
            return [
                {
                    "title": "Sistema de Notícias Temporariamente Indisponível",
                    "description": "As notícias estão sendo atualizadas. Tente novamente em alguns minutos.",
                    "url": "#",
                    "published_at": datetime.now().isoformat(),
                    "source": "sistema",
                    "category": "economy"
                }
            ]

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