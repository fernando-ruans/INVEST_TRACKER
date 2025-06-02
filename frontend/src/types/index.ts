// Interfaces para dados de ativos
export interface AssetInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  exchange: string;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  employees?: number;
  founded?: string;
  headquarters?: string;
}

// Interface para dados históricos
export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

// Interfaces para Portfolio
export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  totalValue?: number;
  totalGain?: number;
  totalGainPercent?: number;
  assets?: PortfolioAsset[];
}

export interface PortfolioAsset {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  totalValue?: number;
  gain?: number;
  gainPercent?: number;
  addedAt: string;
  updatedAt: string;
}

export interface PortfolioCreate {
  name: string;
  description?: string;
}

export interface PortfolioUpdate {
  name?: string;
  description?: string;
}

export interface PortfolioAssetCreate {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface PortfolioAssetUpdate {
  quantity?: number;
  averagePrice?: number;
}

// Interface para notícias
export interface NewsItem {
  id?: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedDate: string;
  imageUrl?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevanceScore?: number;
}

// Interface para eventos econômicos
export interface EconomicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  country: string;
  importance: 'low' | 'medium' | 'high';
  category: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  currency?: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

// Interface para watchlist
export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
}

// Interface para configuração do TradingView (movida para TradingViewChart.tsx)
// export interface TradingViewConfig - agora definida no componente

// Interfaces para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total_found?: number;
  query?: string;
}

export interface ApiError {
  success: false;
  error: string;
  detail?: string;
  status_code?: number;
}

// Interface para performance de portfolio
export interface PortfolioPerformance {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  assetsPerformance: AssetPerformance[];
}

export interface AssetPerformance {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  gain: number;
  gainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  weight: number; // Peso no portfolio (porcentagem)
}

// Interface para resumo de mercado
export interface MarketOverview {
  indices: MarketIndex[];
  topGainers: AssetInfo[];
  topLosers: AssetInfo[];
  mostActive: AssetInfo[];
  currencies: CurrencyRate[];
  commodities: AssetInfo[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface CurrencyRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

// Interface para busca de ativos
export interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
  country?: string;
  sector?: string;
}

// Interface para cotação rápida
export interface QuickQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

// Interface para performance de setor
export interface SectorPerformance {
  sector: string;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
}

// Interface para alocação de portfolio
export interface PortfolioAllocation {
  symbol: string;
  value: number;
  percentage: number;
  quantity: number;
}

// Interface para sugestão de rebalanceamento
export interface RebalanceSuggestion {
  symbol: string;
  currentPercentage: number;
  targetPercentage: number;
  difference: number;
  action: 'buy' | 'sell';
  currentValue: number;
}

// Interface para filtros
export interface NewsFilter {
  category?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CalendarFilter {
  country?: string;
  importance?: 'low' | 'medium' | 'high';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Interface para configurações do usuário
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  timezone: string;
  notifications: {
    priceAlerts: boolean;
    newsAlerts: boolean;
    portfolioUpdates: boolean;
    economicEvents: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'portfolio' | 'watchlist';
    refreshInterval: number;
    showMarketOverview: boolean;
    showNews: boolean;
    showCalendar: boolean;
  };
}

// Interface para alertas de preço
export interface PriceAlert {
  id: number;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

// Tipos utilitários
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'MAX';
export type ChartType = 'line' | 'candlestick' | 'area';
export type SortDirection = 'asc' | 'desc';
export type AssetType = 'stock' | 'etf' | 'crypto' | 'forex' | 'commodity' | 'index';
export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';

// Interface para estado de loading
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Interface para paginação
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface para estatísticas do dashboard
export interface DashboardStats {
  totalPortfolioValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  portfoliosCount: number;
  assetsCount: number;
  watchlistCount: number;
}