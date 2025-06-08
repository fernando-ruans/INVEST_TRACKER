import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Newspaper, AlertCircle, RefreshCw, User } from 'lucide-react';
import { assetService, portfolioService, newsService, calendarService } from '../services/api';
import { MarketOverview, Portfolio, NewsItem, EconomicEvent, DashboardStats } from '../types';
import AssetSearch from './AssetSearch';
import { AdvancedTradingViewChart } from './TradingViewChart';
import InvestingCalendarWidget from './InvestingCalendarWidget';
import MarketTicker from './MarketTicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [todayEvents, setTodayEvents] = useState<EconomicEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('IBOVESPA');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Cache para performance dos portfolios (evitar chamadas repetidas)
  const [performanceCache, setPerformanceCache] = useState<Map<number, { data: any, timestamp: number }>>(new Map());

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 10 minutos (reduzido de 5 para 10 minutos)
    const interval = setInterval(loadDashboardData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Usar Promise.allSettled para carregamento paralelo com melhor controle de erros
      const results = await Promise.allSettled([
        loadMarketOverview(),
        loadPortfolios(),
        loadNews(),
        loadTodayEvents(),
      ]);
      
      // Verificar se pelo menos uma API funcionou
      const successfulResults = results.filter(result => result.status === 'fulfilled');
      
      if (successfulResults.length === 0) {
        throw new Error('Todas as APIs falharam');
      }
      
      // Log dos erros para debug
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const apiNames = ['Market Overview', 'Portfolios', 'News', 'Events'];
          console.warn(`${apiNames[index]} falhou:`, result.reason);
        }
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados. Algumas informações podem estar indisponíveis.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarketOverview = async () => {
    try {
      const overview = await assetService.getMarketOverview();
      setMarketOverview(overview);
    } catch (error) {
      console.error('Erro ao carregar visão geral do mercado:', error);
      // Fallback com dados básicos dos principais índices mundiais
      setMarketOverview({
        indices: [
          // Brasil
          {
            symbol: 'IBOVESPA',
            name: 'Ibovespa',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'IFIX',
            name: 'IFIX',
            price: 0,
            change: 0,
            changePercent: 0
          },
          // Estados Unidos
          {
            symbol: 'SPX',
            name: 'S&P 500',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'IXIC',
            name: 'Nasdaq',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'DJI',
            name: 'Dow Jones',
            price: 0,
            change: 0,
            changePercent: 0
          },
          // Europa
          {
            symbol: 'DAX',
            name: 'DAX 40',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'UKX',
            name: 'FTSE 100',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'CAC',
            name: 'CAC 40',
            price: 0,
            change: 0,
            changePercent: 0
          },
          // Ásia
          {
            symbol: 'NKY',
            name: 'Nikkei 225',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'HSI',
            name: 'Hang Seng',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'SHCOMP',
            name: 'Shanghai',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'KOSPI',
            name: 'KOSPI',
            price: 0,
            change: 0,
            changePercent: 0
          }
        ],
        topGainers: [],
        topLosers: [],
        mostActive: [],
        currencies: [],
        commodities: []
      });
      throw error; // Re-throw para que Promise.allSettled capture
    }
  };

  const loadPortfolios = async () => {
    try {
      const portfolioList = await portfolioService.getPortfolios();
      setPortfolios(portfolioList);
      
      // Calcular estatísticas do dashboard de forma assíncrona
      if (portfolioList.length > 0) {
        // Não bloquear o carregamento principal para calcular stats
        calculateDashboardStats(portfolioList).then(stats => {
          setDashboardStats(stats);
        }).catch(error => {
          console.error('Erro ao calcular estatísticas:', error);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar portfolios:', error);
      throw error; // Re-throw para que Promise.allSettled capture
    }
  };

  const loadNews = async () => {
    try {
      const headlines = await newsService.getHeadlines(10);
      setNews(headlines);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      // Fallback com notícias padrão
      setNews([
        {
          id: '1',
          title: 'Mercado em análise',
          description: 'Acompanhe as principais movimentações do mercado.',
          url: '#',
          publishedDate: new Date().toISOString(),
          source: 'Sistema',
          category: 'economy'
        }
      ]);
      throw error; // Re-throw para que Promise.allSettled capture
    }
  };

  const loadTodayEvents = async () => {
    try {
      const events = await calendarService.getTodayEvents();
      setTodayEvents(events.slice(0, 5)); // Mostrar apenas os 5 primeiros
    } catch (error) {
      console.error('Erro ao carregar eventos de hoje:', error);
      setTodayEvents([]); // Fallback vazio
      throw error; // Re-throw para que Promise.allSettled capture
    }
  };

  const calculateDashboardStats = async (portfolioList: Portfolio[]): Promise<DashboardStats> => {
    let totalValue = 0;
    let totalGain = 0;
    let totalGainPercent = 0;
    let dayGain = 0;
    let dayGainPercent = 0;
    let assetsCount = 0;
    
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache

    for (const portfolio of portfolioList) {
      try {
        let performance: any;
        const cached = performanceCache.get(portfolio.id);
        
        // Verificar se temos dados em cache válidos
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          performance = cached.data;
        } else {
          // Buscar dados frescos e atualizar cache
          performance = await portfolioService.getPortfolioPerformance(portfolio.id);
          setPerformanceCache(prev => new Map(prev.set(portfolio.id, { data: performance, timestamp: now })));
        }
        
        totalValue += performance.totalValue;
        totalGain += performance.totalGain;
        dayGain += performance.dayGain;
        assetsCount += performance.assetsPerformance.length;
      } catch (error) {
        console.error(`Erro ao calcular performance do portfolio ${portfolio.id}:`, error);
      }
    }

    if (totalValue > 0) {
      totalGainPercent = (totalGain / (totalValue - totalGain)) * 100;
      dayGainPercent = (dayGain / totalValue) * 100;
    }

    return {
      totalPortfolioValue: totalValue,
      totalGain,
      totalGainPercent,
      dayGain,
      dayGainPercent,
      portfoliosCount: portfolioList.length,
      assetsCount,
      watchlistCount: 0, // Implementar watchlist futuramente
    };
  };

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success-600';
    if (value < 0) return 'text-danger-600';
    return 'text-gray-600';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-danger-100 text-danger-800';
      case 'medium': return 'bg-warning-100 text-warning-800';
      case 'low': return 'bg-success-100 text-success-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:py-6 space-y-4 lg:space-y-0">
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                Última atualização: {format(lastUpdate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4">
              <AssetSearch
                onAssetSelect={(asset: any) => {
                  if (asset && asset.symbol && asset.symbol.trim() !== '') {
                    setSelectedSymbol(asset.symbol);
                  }
                }}
                className="w-full sm:w-64 lg:w-80"
                placeholder="Buscar ativo..."
              />
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center justify-center px-3 lg:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-danger-50 dark:bg-red-900/20 border border-danger-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-danger-400 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-danger-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Ticker */}
        <div className="mb-6">
          <MarketTicker className="rounded-lg shadow-sm" />
        </div>

        {/* Welcome Section */}
        {user && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-lg shadow-lg mb-6 lg:mb-8 overflow-hidden">
            <div className="px-4 sm:px-6 py-6 lg:py-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar?.startsWith('http') ? user.avatar : `http://localhost:8000/uploads/avatars/${user.avatar.split('/').pop()}`}
                      alt={user.fullName || user.username}
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    Bem-vindo de volta, {user.fullName || user.username}!
                  </h2>
                  <p className="text-primary-100 mt-1 text-sm lg:text-base">
                    Aqui está um resumo dos seus investimentos hoje
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="text-right">
                    <p className="text-primary-100 text-sm">
                      {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-white font-medium">
                      {format(new Date(), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="ml-3 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Valor Total</dt>
                      <dd className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                        {formatCurrency(dashboardStats.totalPortfolioValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="ml-3 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ganho Total</dt>
                      <dd className={`text-sm sm:text-base lg:text-lg font-medium ${getChangeColor(dashboardStats.totalGain)}`}>
                        {formatCurrency(dashboardStats.totalGain)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="ml-3 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ganho/Perda</dt>
                      <dd className={`text-sm sm:text-base lg:text-lg font-medium ${getChangeColor(dashboardStats.totalGainPercent)}`}>
                        {formatPercent(dashboardStats.totalGainPercent)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="ml-3 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Portfolios</dt>
                      <dd className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                        {dashboardStats.portfoliosCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico Principal - Largura Total */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Gráfico - {selectedSymbol}
              </h3>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              {selectedSymbol ? (
                <AdvancedTradingViewChart 
                  symbol={selectedSymbol} 
                  height={window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 600} 
                />
              ) : (
                <div className="flex items-center justify-center h-48 sm:h-64 lg:h-96 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 lg:mb-4">📊</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Selecione um ativo para visualizar o gráfico</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards Informativos - Abaixo do Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Índices Principais */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Índices Principais</h3>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-96 sm:max-h-none">
              {marketOverview && marketOverview.indices && marketOverview.indices.length > 0 ? (
                <div className="space-y-6">
                  {/* Brasil */}
                  {marketOverview.indices.filter(index => ['IBOVESPA', 'IFIX', 'SMLL', 'IDIV'].includes(index.symbol)).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">BRASIL</h4>
                      <div className="space-y-3">
                        {marketOverview.indices
                          .filter(index => ['IBOVESPA', 'IFIX', 'SMLL', 'IDIV'].includes(index.symbol))
                          .map((index) => (
                            <div 
                              key={index.symbol} 
                              className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                if (index.symbol && index.symbol.trim() !== '') {
                                  setSelectedSymbol(index.symbol);
                                }
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{index.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {index.price && index.price > 0 ? index.price.toLocaleString('pt-BR') : 'Carregando...'}
                                </p>
                                <p className={`text-xs ${getChangeColor(index.change || 0)}`}>
                                  {index.changePercent && index.changePercent !== 0 ? formatPercent(index.changePercent) : '--'}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Estados Unidos */}
                   {marketOverview.indices.filter(index => ['SPX', 'IXIC', 'DJI'].includes(index.symbol)).length > 0 && (
                     <div>
                       <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">ESTADOS UNIDOS</h4>
                       <div className="space-y-3">
                         {marketOverview.indices
                           .filter(index => ['SPX', 'IXIC', 'DJI'].includes(index.symbol))
                          .map((index) => (
                            <div 
                              key={index.symbol} 
                              className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                if (index.symbol && index.symbol.trim() !== '') {
                                  setSelectedSymbol(index.symbol);
                                }
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{index.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {index.price && index.price > 0 ? index.price.toLocaleString('pt-BR') : 'Carregando...'}
                                </p>
                                <p className={`text-xs ${getChangeColor(index.change || 0)}`}>
                                  {index.changePercent && index.changePercent !== 0 ? formatPercent(index.changePercent) : '--'}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Europa */}
                   {marketOverview.indices.filter(index => ['DAX', 'UKX', 'CAC'].includes(index.symbol)).length > 0 && (
                     <div>
                       <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide">EUROPA</h4>
                       <div className="space-y-3">
                         {marketOverview.indices
                           .filter(index => ['DAX', 'UKX', 'CAC'].includes(index.symbol))
                          .map((index) => (
                            <div 
                              key={index.symbol} 
                              className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                if (index.symbol && index.symbol.trim() !== '') {
                                  setSelectedSymbol(index.symbol);
                                }
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{index.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {index.price && index.price > 0 ? index.price.toLocaleString('pt-BR') : 'Carregando...'}
                                </p>
                                <p className={`text-xs ${getChangeColor(index.change || 0)}`}>
                                  {index.changePercent && index.changePercent !== 0 ? formatPercent(index.changePercent) : '--'}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Ásia */}
                   {marketOverview.indices.filter(index => ['NKY', 'HSI', 'SHCOMP', 'KOSPI'].includes(index.symbol)).length > 0 && (
                     <div>
                       <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wide">ÁSIA</h4>
                       <div className="space-y-3">
                         {marketOverview.indices
                           .filter(index => ['NKY', 'HSI', 'SHCOMP', 'KOSPI'].includes(index.symbol))
                          .map((index) => (
                            <div 
                              key={index.symbol} 
                              className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                if (index.symbol && index.symbol.trim() !== '') {
                                  setSelectedSymbol(index.symbol);
                                }
                              }}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{index.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {index.price && index.price > 0 ? index.price.toLocaleString('pt-BR') : 'Carregando...'}
                                </p>
                                <p className={`text-xs ${getChangeColor(index.change || 0)}`}>
                                  {index.changePercent && index.changePercent !== 0 ? formatPercent(index.changePercent) : '--'}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Dados de mercado indisponíveis</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Eventos de Hoje */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-300 mr-2" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Eventos de Hoje</h3>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <InvestingCalendarWidget 
                theme={theme === 'dark' ? 'dark' : 'light'}
                height={window.innerWidth < 480 ? 300 : window.innerWidth < 768 ? 400 : window.innerWidth < 1024 ? 500 : 600} 
                width="100%"
                timeSpan="today"
                showCountries={['BR', 'US', 'EU', 'GB', 'CN', 'JP']}
                importanceLevel={3}
                className="responsive-calendar"
              />
            </div>
          </div>

          {/* Notícias */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-300 mr-2" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Últimas Notícias</h3>
              </div>
            </div>
            <div className="p-4 sm:p-6 max-h-96 sm:max-h-none overflow-y-auto">
              {news.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {news.slice(0, window.innerWidth < 640 ? 5 : news.length).map((article, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded transition-colors"
                      >
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {article.title}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 space-y-1 sm:space-y-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{article.source}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {article.publishedDate && !isNaN(new Date(article.publishedDate).getTime()) 
                              ? format(new Date(article.publishedDate), 'dd/MM HH:mm', { locale: ptBR })
                              : 'Data não disponível'
                            }
                          </p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nenhuma notícia disponível.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;