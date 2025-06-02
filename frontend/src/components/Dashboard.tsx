import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Newspaper, AlertCircle, RefreshCw } from 'lucide-react';
import { assetService, portfolioService, newsService, calendarService } from '../services/api';
import { MarketOverview, Portfolio, NewsItem, EconomicEvent, DashboardStats } from '../types';
import AssetSearch from './AssetSearch';
import { SimpleTradingViewChart } from './TradingViewChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [todayEvents, setTodayEvents] = useState<EconomicEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('IBOVESPA');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      await Promise.all([
        loadMarketOverview(),
        loadPortfolios(),
        loadNews(),
        loadTodayEvents(),
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados. Tente novamente.');
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
      // Fallback com dados básicos dos principais índices
      setMarketOverview({
        indices: [
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
          {
            symbol: 'SMLL',
            name: 'Small Cap',
            price: 0,
            change: 0,
            changePercent: 0
          },
          {
            symbol: 'IDIV',
            name: 'Dividendos',
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
    }
  };

  const loadPortfolios = async () => {
    try {
      const portfolioList = await portfolioService.getPortfolios();
      setPortfolios(portfolioList);
      
      // Calcular estatísticas do dashboard
      if (portfolioList.length > 0) {
        const stats = await calculateDashboardStats(portfolioList);
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar portfolios:', error);
    }
  };

  const loadNews = async () => {
    try {
      const headlines = await newsService.getHeadlines(6);
      setNews(headlines);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    }
  };

  const loadTodayEvents = async () => {
    try {
      const events = await calendarService.getTodayEvents();
      setTodayEvents(events.slice(0, 5)); // Mostrar apenas os 5 primeiros
    } catch (error) {
      console.error('Erro ao carregar eventos de hoje:', error);
    }
  };

  const calculateDashboardStats = async (portfolioList: Portfolio[]): Promise<DashboardStats> => {
    let totalValue = 0;
    let totalGain = 0;
    let totalGainPercent = 0;
    let dayGain = 0;
    let dayGainPercent = 0;
    let assetsCount = 0;

    for (const portfolio of portfolioList) {
      try {
        const performance = await portfolioService.getPortfolioPerformance(portfolio.id);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Última atualização: {format(lastUpdate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <AssetSearch
                onAssetSelect={(asset: any) => {
                  if (asset && asset.symbol && asset.symbol.trim() !== '') {
                    setSelectedSymbol(asset.symbol);
                  }
                }}
                className="w-80"
                placeholder="Buscar ativo para o gráfico..."
              />
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-danger-400" />
              <div className="ml-3">
                <p className="text-sm text-danger-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(dashboardStats.totalPortfolioValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ganho Total</dt>
                      <dd className={`text-lg font-medium ${getChangeColor(dashboardStats.totalGain)}`}>
                        {formatCurrency(dashboardStats.totalGain)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Ganho do Dia</dt>
                      <dd className={`text-lg font-medium ${getChangeColor(dashboardStats.dayGain)}`}>
                        {formatCurrency(dashboardStats.dayGain)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Portfolios</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.portfoliosCount}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Gráfico - {selectedSymbol}
                </h3>
              </div>
              <div className="p-6">
                {selectedSymbol ? (
                  <SimpleTradingViewChart symbol={selectedSymbol} height={400} />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-500">Selecione um ativo para visualizar o gráfico</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Índices Principais */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Índices Principais</h3>
              </div>
              <div className="p-6">
                {marketOverview && marketOverview.indices && marketOverview.indices.length > 0 ? (
                  <div className="space-y-4">
                    {marketOverview.indices.slice(0, 4).map((index) => (
                      <div 
                        key={index.symbol} 
                        className="flex justify-between items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (index.symbol && index.symbol.trim() !== '') {
                            setSelectedSymbol(index.symbol);
                          }
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{index.name}</p>
                          <p className="text-xs text-gray-500">{index.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {index.price && index.price > 0 ? index.price.toLocaleString('pt-BR') : 'Carregando...'}
                          </p>
                          <p className={`text-xs ${getChangeColor(index.change || 0)}`}>
                            {index.changePercent && index.changePercent !== 0 ? formatPercent(index.changePercent) : '--'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <p className="text-gray-500 text-sm">Dados de mercado indisponíveis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Eventos de Hoje */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Eventos de Hoje</h3>
                </div>
              </div>
              <div className="p-6">
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-primary-400 pl-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.country}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getImportanceColor(event.importance)}`}>
                            {event.importance}
                          </span>
                        </div>
                        {event.time && (
                          <p className="text-xs text-gray-400 mt-1">{event.time}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum evento importante hoje.</p>
                )}
              </div>
            </div>

            {/* Notícias */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Newspaper className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Últimas Notícias</h3>
                </div>
              </div>
              <div className="p-6">
                {news.length > 0 ? (
                  <div className="space-y-4">
                    {news.map((article, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 -m-2 p-2 rounded"
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {article.title}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">{article.source}</p>
                            <p className="text-xs text-gray-400">
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
                  <p className="text-sm text-gray-500">Nenhuma notícia disponível.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;