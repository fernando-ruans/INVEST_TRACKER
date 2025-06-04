import axios, { AxiosResponse } from 'axios';
import {
  AssetInfo,
  HistoricalData,
  Portfolio,
  PortfolioCreate,
  PortfolioUpdate,
  PortfolioAsset,
  PortfolioAssetCreate,
  PortfolioAssetUpdate,
  NewsItem,
  EconomicEvent,
  ApiResponse,
  MarketOverview,
  AssetSearchResult,
  QuickQuote,
  SectorPerformance,
  PortfolioPerformance,
  PortfolioAllocation,
  RebalanceSuggestion,
  NewsFilter,
  CalendarFilter
} from '../types';

// Configuração base do Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Erro com resposta do servidor
      const message = error.response.data?.detail || error.response.data?.message || 'Erro no servidor';
      throw new Error(message);
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      throw new Error('Erro inesperado.');
    }
  }
);

// Serviços de Assets
export const assetService = {
  // Obter informações de um ativo
  async getAssetInfo(symbol: string): Promise<AssetInfo> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/assets/info/${symbol}`);
    const backendData = response.data.data;
    
    // Mapear dados do backend para o formato esperado pelo frontend
    const mappedData: AssetInfo = {
      symbol: backendData.symbol,
      name: backendData.name,
      price: backendData.current_price || 0,
      change: backendData.change || 0,
      changePercent: backendData.change_percent || 0,
      volume: backendData.volume,
      marketCap: backendData.market_cap,
      peRatio: backendData.pe_ratio,
      dividendYield: backendData.dividend_yield,
      fiftyTwoWeekHigh: backendData.fifty_two_week_high || 0,
      fiftyTwoWeekLow: backendData.fifty_two_week_low || 0,
      currency: backendData.currency || 'USD',
      exchange: backendData.exchange || '',
      sector: backendData.sector,
      industry: backendData.industry,
      description: backendData.description,
      website: backendData.website,
      employees: backendData.employees,
      founded: backendData.founded,
      headquarters: backendData.headquarters
    };
    
    return mappedData;
  },

  // Obter dados históricos
  async getHistoricalData(
    symbol: string,
    period: string = '1y',
    interval: string = '1d'
  ): Promise<HistoricalData[]> {
    const response: AxiosResponse<ApiResponse<HistoricalData[]>> = await api.get(
      `/assets/historical/${symbol}?period=${period}&interval=${interval}`
    );
    return response.data.data;
  },

  // Buscar ativos
  async searchAssets(query: string, limit: number = 10): Promise<AssetSearchResult[]> {
    const response: AxiosResponse<ApiResponse<AssetSearchResult[]>> = await api.get(
      `/assets/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data;
  },

  // Obter visão geral do mercado
  async getMarketOverview(): Promise<MarketOverview> {
    const response: AxiosResponse<ApiResponse<MarketOverview>> = await api.get('/assets/market-overview');
    return response.data.data;
  },

  // Obter múltiplos ativos
  async getMultipleAssets(symbols: string[]): Promise<AssetInfo[]> {
    const symbolsParam = symbols.join(',');
    const response: AxiosResponse<ApiResponse<AssetInfo[]>> = await api.get(
      `/assets/multiple?symbols=${symbolsParam}`
    );
    return response.data.data;
  },

  // Obter cotação rápida
  async getQuickQuote(symbol: string): Promise<QuickQuote> {
    const response: AxiosResponse<ApiResponse<QuickQuote>> = await api.get(`/assets/${symbol}/quote`);
    return response.data.data;
  },

  // Obter ativos em alta
  async getTrendingAssets(limit: number = 10): Promise<AssetInfo[]> {
    const response: AxiosResponse<ApiResponse<AssetInfo[]>> = await api.get(
      `/assets/trending?limit=${limit}`
    );
    return response.data.data;
  },

  // Obter performance por setor
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    const response: AxiosResponse<ApiResponse<SectorPerformance[]>> = await api.get('/assets/sectors');
    return response.data.data;
  },
};

// Serviços de Portfolio
export const portfolioService = {
  // Criar portfolio
  async createPortfolio(data: PortfolioCreate): Promise<Portfolio> {
    const response: AxiosResponse<ApiResponse<Portfolio>> = await api.post('/portfolio', data);
    return response.data.data;
  },

  // Obter todos os portfolios
  async getPortfolios(): Promise<Portfolio[]> {
    const response: AxiosResponse<ApiResponse<Portfolio[]>> = await api.get('/portfolio');
    return response.data.data;
  },

  // Obter portfolio específico
  async getPortfolio(id: number): Promise<Portfolio> {
    const response: AxiosResponse<ApiResponse<Portfolio>> = await api.get(`/portfolio/${id}`);
    return response.data.data;
  },

  // Atualizar portfolio
  async updatePortfolio(id: number, data: PortfolioUpdate): Promise<Portfolio> {
    const response: AxiosResponse<ApiResponse<Portfolio>> = await api.put(`/portfolio/${id}`, data);
    return response.data.data;
  },

  // Deletar portfolio
  async deletePortfolio(id: number): Promise<void> {
    await api.delete(`/portfolio/${id}`);
  },

  // Adicionar ativo ao portfolio
  async addAssetToPortfolio(portfolioId: number, data: PortfolioAssetCreate): Promise<PortfolioAsset> {
    // Converter camelCase para snake_case para o backend
    const backendData = {
      symbol: data.symbol,
      quantity: data.quantity,
      average_price: data.averagePrice
    };
    
    const response: AxiosResponse<ApiResponse<PortfolioAsset>> = await api.post(
      `/portfolio/${portfolioId}/assets`,
      backendData
    );
    return response.data.data;
  },

  // Obter ativos do portfolio
  async getPortfolioAssets(portfolioId: number): Promise<PortfolioAsset[]> {
    try {
      console.log(`Fetching portfolio assets for ID: ${portfolioId}`);
      const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
        `/portfolio/${portfolioId}/assets`
      );
      console.log('Portfolio assets response:', response.data);
      
      // Mapear dados do backend (snake_case) para frontend (camelCase)
      const mappedAssets: PortfolioAsset[] = response.data.data.map((asset: any) => ({
        id: asset.id,
        portfolioId: asset.portfolio_id,
        symbol: asset.symbol,
        quantity: asset.quantity,
        averagePrice: asset.average_price,
        currentPrice: asset.current_price,
        totalValue: asset.total_value,
        gain: asset.profit_loss,
        gainPercent: asset.profit_loss_percent,
        addedAt: asset.created_at,
        updatedAt: asset.updated_at
      }));
      
      return mappedAssets;
    } catch (error) {
      console.error('Error fetching portfolio assets:', error);
      throw error;
    }
  },

  // Atualizar ativo do portfolio
  async updatePortfolioAsset(assetId: number, data: PortfolioAssetUpdate): Promise<PortfolioAsset> {
    const response: AxiosResponse<ApiResponse<PortfolioAsset>> = await api.put(
      `/portfolio/assets/${assetId}`,
      data
    );
    return response.data.data;
  },

  // Remover ativo do portfolio
  async removeAssetFromPortfolio(assetId: number): Promise<void> {
    await api.delete(`/portfolio/assets/${assetId}`);
  },

  // Obter performance do portfolio
  async getPortfolioPerformance(portfolioId: number): Promise<PortfolioPerformance> {
    try {
      console.log(`Fetching portfolio performance for ID: ${portfolioId}`);
      const response: AxiosResponse<ApiResponse<any>> = await api.get(
        `/portfolio/${portfolioId}/performance`
      );
      console.log('Portfolio performance response:', response.data);
      
      // Mapear dados do backend (snake_case) para frontend (camelCase)
      const backendData = response.data.data;
      const mappedData: PortfolioPerformance = {
        totalValue: backendData.total_value || 0,
        totalInvested: backendData.total_cost || 0,
        totalGain: backendData.total_gain_loss || 0,
        totalGainPercent: backendData.total_gain_loss_percent || 0,
        dayGain: backendData.day_gain || 0,
        dayGainPercent: backendData.day_gain_percent || 0,
        assetsPerformance: (backendData.assets_performance || []).map((asset: any) => ({
          symbol: asset.symbol,
          quantity: asset.quantity,
          averagePrice: asset.average_price,
          currentPrice: asset.current_price,
          currentValue: asset.current_value,
          gain: asset.gain_loss,
          gainPercent: asset.gain_loss_percent,
          dayGain: asset.day_gain || 0,
          dayGainPercent: asset.day_gain_percent || 0,
          weight: asset.weight || 0
        }))
      };
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      throw error;
    }
  },

  // Obter resumo do portfolio
  async getPortfolioSummary(portfolioId: number): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/portfolio/${portfolioId}/summary`);
    return response.data.data;
  },

  // Obter alocação do portfolio
  async getPortfolioAllocation(portfolioId: number): Promise<PortfolioAllocation[]> {
    const response: AxiosResponse<ApiResponse<PortfolioAllocation[]>> = await api.get(
      `/portfolio/${portfolioId}/allocation`
    );
    return response.data.data;
  },

  // Sugerir rebalanceamento
  async suggestRebalance(
    portfolioId: number,
    targetAllocation: Record<string, number>
  ): Promise<RebalanceSuggestion[]> {
    const response: AxiosResponse<ApiResponse<RebalanceSuggestion[]>> = await api.post(
      `/portfolio/${portfolioId}/rebalance`,
      targetAllocation
    );
    return response.data.data;
  },
};

// Função para mapear dados de notícias do backend para o formato do frontend
const mapNewsItem = (backendNews: any): NewsItem => {
  return {
    id: backendNews.id?.toString() || Math.random().toString(),
    title: backendNews.title || 'Título não disponível',
    description: backendNews.description || '',
    url: backendNews.url || '#',
    source: backendNews.source || 'Fonte desconhecida',
    publishedDate: backendNews.published_at || backendNews.publishedDate || new Date().toISOString(),
    imageUrl: backendNews.image_url || backendNews.imageUrl,
    category: backendNews.category,
    sentiment: backendNews.sentiment as 'positive' | 'negative' | 'neutral' | undefined,
    relevanceScore: backendNews.relevance_score || backendNews.relevanceScore
  };
};

// Serviços de Notícias
export const newsService = {
  // Obter notícias financeiras
  async getFinancialNews(limit: number = 20, category?: string): Promise<NewsItem[]> {
    let url = `/news?limit=${limit}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(url);
    return response.data.data.map(mapNewsItem);
  },

  // Obter notícias de um ativo específico
  async getAssetNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
      `/news/asset/${symbol}?limit=${limit}`
    );
    return response.data.data.map(mapNewsItem);
  },

  // Obter categorias de notícias
  async getNewsCategories(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/news/categories');
    return response.data.data;
  },

  // Obter notícias em alta
  async getTrendingNews(limit: number = 10): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/news/trending?limit=${limit}`);
    return response.data.data.map(mapNewsItem);
  },

  // Buscar notícias
  async searchNews(query: string, limit: number = 15): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
      `/news/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data.map(mapNewsItem);
  },

  // Obter fontes de notícias
  async getNewsSources(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/news/sources');
    return response.data.data;
  },

  // Obter resumo de notícias
  async getNewsSummary(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/news/summary');
    return response.data.data;
  },

  // Obter manchetes
  async getHeadlines(limit: number = 5): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/news/headlines?limit=${limit}`);
    return response.data.data.map(mapNewsItem);
  },
};

// Serviços de Calendário Econômico
// Função para mapear dados do backend para o formato do frontend
const mapEconomicEvent = (backendEvent: any): EconomicEvent => {
  // Extrair data e hora do campo datetime se disponível
  let date = backendEvent.date;
  let time = backendEvent.time;
  
  if (backendEvent.datetime && !date) {
    const datetime = new Date(backendEvent.datetime);
    date = datetime.toISOString().split('T')[0]; // YYYY-MM-DD
    time = datetime.toTimeString().slice(0, 5); // HH:MM
  }
  
  return {
    id: backendEvent.id?.toString() || Math.random().toString(),
    title: backendEvent.title || backendEvent.event || 'Evento Econômico',
    description: backendEvent.description || '',
    date: date || new Date().toISOString().split('T')[0],
    time: time,
    country: backendEvent.country || 'US',
    importance: (backendEvent.importance?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high',
    category: backendEvent.category || 'Economic',
    actual: backendEvent.actual,
    forecast: backendEvent.forecast,
    previous: backendEvent.previous,
    currency: backendEvent.currency,
    impact: backendEvent.impact as 'positive' | 'negative' | 'neutral' | undefined
  };
};

export const calendarService = {
  // Obter eventos econômicos
  async getEconomicEvents(filters: CalendarFilter = {}): Promise<EconomicEvent[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
      `/calendar/events?${params.toString()}`
    );
    return response.data.data.map(mapEconomicEvent);
  },

  // Obter eventos de hoje
  async getTodayEvents(filters: CalendarFilter = {}): Promise<EconomicEvent[]> {
    let url = '/calendar/today';
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.importance) params.append('importance', filters.importance);
    if (filters.category) params.append('category', filters.category);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(url);
    return response.data.data.map(mapEconomicEvent);
  },

  // Obter eventos da semana
  async getThisWeekEvents(filters: CalendarFilter = {}): Promise<EconomicEvent[]> {
    let url = '/calendar/week';
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.importance) params.append('importance', filters.importance);
    if (filters.category) params.append('category', filters.category);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(url);
    return response.data.data.map(mapEconomicEvent);
  },

  // Obter próximos eventos
  async getUpcomingEvents(
    days: number = 7,
    filters: CalendarFilter = {}
  ): Promise<EconomicEvent[]> {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
      `/calendar/upcoming?${params.toString()}`
    );
    return response.data.data.map(mapEconomicEvent);
  },

  // Obter países disponíveis
  async getAvailableCountries(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/calendar/countries');
    return response.data.data;
  },

  // Obter categorias de eventos
  async getEventCategories(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/calendar/categories');
    return response.data.data;
  },

  // Obter níveis de importância
  async getImportanceLevels(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/calendar/importance-levels');
    return response.data.data;
  },

  // Obter resumo do calendário
  async getCalendarSummary(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/calendar/summary');
    return response.data.data;
  },

  // Obter eventos por data específica
  async getEventsByDate(date: string, filters: CalendarFilter = {}): Promise<EconomicEvent[]> {
    let url = `/calendar/events`;
    const params = new URLSearchParams();
    
    params.append('date', date);
    if (filters.country) params.append('country', filters.country);
    if (filters.importance) params.append('importance', filters.importance);
    if (filters.category) params.append('category', filters.category);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(url);
    return response.data.data.map(mapEconomicEvent);
  },

  // Buscar eventos
  async searchEvents(query: string, limit: number = 20): Promise<EconomicEvent[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
      `/calendar/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data.map(mapEconomicEvent);
  },
};

// Exportar instância do axios para uso direto se necessário
export default api;