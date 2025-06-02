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
    const response: AxiosResponse<ApiResponse<PortfolioAsset>> = await api.post(
      `/portfolio/${portfolioId}/assets`,
      data
    );
    return response.data.data;
  },

  // Obter ativos do portfolio
  async getPortfolioAssets(portfolioId: number): Promise<PortfolioAsset[]> {
    const response: AxiosResponse<ApiResponse<PortfolioAsset[]>> = await api.get(
      `/portfolio/${portfolioId}/assets`
    );
    return response.data.data;
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
    const response: AxiosResponse<ApiResponse<PortfolioPerformance>> = await api.get(
      `/portfolio/${portfolioId}/performance`
    );
    return response.data.data;
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

// Serviços de Notícias
export const newsService = {
  // Obter notícias financeiras
  async getFinancialNews(limit: number = 20, category?: string): Promise<NewsItem[]> {
    let url = `/news?limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response: AxiosResponse<ApiResponse<NewsItem[]>> = await api.get(url);
    return response.data.data;
  },

  // Obter notícias de um ativo específico
  async getAssetNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<NewsItem[]>> = await api.get(
      `/news/asset/${symbol}?limit=${limit}`
    );
    return response.data.data;
  },

  // Obter categorias de notícias
  async getNewsCategories(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/news/categories');
    return response.data.data;
  },

  // Obter notícias em alta
  async getTrendingNews(limit: number = 10): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<NewsItem[]>> = await api.get(`/news/trending?limit=${limit}`);
    return response.data.data;
  },

  // Buscar notícias
  async searchNews(query: string, limit: number = 15): Promise<NewsItem[]> {
    const response: AxiosResponse<ApiResponse<NewsItem[]>> = await api.get(
      `/news/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data;
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
  async getHeadlines(limit: number = 5): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/news/headlines?limit=${limit}`);
    return response.data.data;
  },
};

// Serviços de Calendário Econômico
export const calendarService = {
  // Obter eventos econômicos
  async getEconomicEvents(filters: CalendarFilter = {}): Promise<EconomicEvent[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(
      `/calendar/events?${params.toString()}`
    );
    return response.data.data;
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

    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(url);
    return response.data.data;
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

    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(url);
    return response.data.data;
  },

  // Obter próximos eventos
  async getUpcomingEvents(
    days: number = 7,
    country?: string,
    importance?: string,
    limit: number = 20
  ): Promise<EconomicEvent[]> {
    const params = new URLSearchParams({
      days: days.toString(),
      limit: limit.toString(),
    });
    
    if (country) params.append('country', country);
    if (importance) params.append('importance', importance);

    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(
      `/calendar/upcoming?${params.toString()}`
    );
    return response.data.data;
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

    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(url);
    return response.data.data;
  },

  // Buscar eventos
  async searchEvents(query: string, limit: number = 20): Promise<EconomicEvent[]> {
    const response: AxiosResponse<ApiResponse<EconomicEvent[]>> = await api.get(
      `/calendar/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data;
  },
};

// Exportar instância do axios para uso direto se necessário
export default api;