import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Star, BarChart3 } from 'lucide-react';
import { assetService } from '../services/api';
import { AssetSearchResult, AssetInfo } from '../types';
import AssetCard from './AssetCard';
import { AdvancedTradingViewChart } from './TradingViewChart';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [trendingAssets, setTrendingAssets] = useState<AssetInfo[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { value: 'all', label: 'Todos' },
    { value: 'equity', label: 'Ações' },
    { value: 'etf', label: 'ETFs' },
    { value: 'cryptocurrency', label: 'Criptomoedas' },
    { value: 'currency', label: 'Forex' },
    { value: 'commodity', label: 'Commodities' },
    { value: 'index', label: 'Índices' },
    { value: 'mutualfund', label: 'Fundos' },
  ];

  // Função para normalizar tipos de ativos
  const normalizeAssetType = (type: string): string => {
    if (!type) return 'unknown';
    const normalizedType = type.toLowerCase();
    
    // Mapeamento dos tipos do Yahoo Finance para tipos padronizados
    const typeMapping: { [key: string]: string } = {
      'equity': 'equity',
      'stock': 'equity',
      'etf': 'etf',
      'cryptocurrency': 'cryptocurrency',
      'currency': 'currency',
      'forex': 'currency',
      'commodity': 'commodity',
      'index': 'index',
      'mutualfund': 'mutualfund',
      'fund': 'mutualfund'
    };
    
    return typeMapping[normalizedType] || normalizedType;
  };

  // Função para determinar se um ativo é brasileiro
  const isBrazilianAsset = (result: AssetSearchResult): boolean => {
    const symbol = result.symbol?.toUpperCase() || '';
    const exchange = result.exchange?.toUpperCase() || '';
    
    // Verifica se é da B3 ou BMF
    if (exchange.includes('B3') || exchange.includes('BMF') || exchange.includes('SAO')) {
      return true;
    }
    
    // Verifica se o símbolo termina com .SA (ações brasileiras)
    if (symbol.endsWith('.SA')) {
      return true;
    }
    
    return false;
  };

  // Filtered search results
  const filteredSearchResults = React.useMemo(() => {
    if (selectedFilter === 'all') return searchResults;
    
    return searchResults.filter((result) => {
      const normalizedType = normalizeAssetType(result.type);
      
      // Filtros por tipo de ativo
      if (selectedFilter === 'equity') {
        return normalizedType === 'equity';
      }
      if (selectedFilter === 'etf') {
        return normalizedType === 'etf';
      }
      if (selectedFilter === 'cryptocurrency') {
        return normalizedType === 'cryptocurrency';
      }
      if (selectedFilter === 'currency') {
        return normalizedType === 'currency';
      }
      if (selectedFilter === 'commodity') {
        return normalizedType === 'commodity';
      }
      if (selectedFilter === 'index') {
        return normalizedType === 'index';
      }
      if (selectedFilter === 'mutualfund') {
        return normalizedType === 'mutualfund';
      }
      
      return false;
    });
  }, [searchResults, selectedFilter]);

  // Trending assets (no filter, as AssetInfo has no type)
  const filteredTrendingAssets = trendingAssets;

  useEffect(() => {
    loadTrendingAssets();
  }, []);

  const loadTrendingAssets = async () => {
    try {
      setTrendingLoading(true);
      const data = await assetService.getTrendingAssets();
      setTrendingAssets(data);
    } catch (error) {
      console.error('Erro ao carregar ativos em alta:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await assetService.searchAssets(searchTerm, 20);
      console.log('Search results:', data); // Debug log
      setSearchResults(data);
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelect = async (symbol: string) => {
    try {
      const assetInfo = await assetService.getAssetInfo(symbol);
      setSelectedAsset(assetInfo);
    } catch (error) {
      console.error('Erro ao carregar informações do ativo:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Função para obter a cor do badge baseada no tipo
  const getBadgeColor = (type: string): string => {
    const normalizedType = normalizeAssetType(type);
    const colorMap: { [key: string]: string } = {
      'equity': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'etf': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'cryptocurrency': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'currency': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'commodity': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'index': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'mutualfund': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    };
    
    return colorMap[normalizedType] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Função para obter o nome amigável do tipo
  const getFriendlyTypeName = (type: string): string => {
    const normalizedType = normalizeAssetType(type);
    const nameMap: { [key: string]: string } = {
      'equity': 'Ação',
      'etf': 'ETF',
      'cryptocurrency': 'Cripto',
      'currency': 'Forex',
      'commodity': 'Commodity',
      'index': 'Índice',
      'mutualfund': 'Fundo'
    };
    
    return nameMap[normalizedType] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buscar Ativos</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Encontre e analise ações, criptomoedas, forex e commodities.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Digite o símbolo ou nome do ativo (ex: AAPL, Bitcoin, EUR/USD)..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2 flex-wrap">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Filtrar por:</span>
                <div className="flex space-x-2 flex-wrap">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedFilter === filter.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Results count */}
              {searchResults.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredSearchResults.length} de {searchResults.length} resultados
                  {selectedFilter !== 'all' && ` (filtrado por ${filters.find(f => f.value === selectedFilter)?.label})`}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {filteredSearchResults.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Resultados da Busca ({filteredSearchResults.length})
                </h2>
                <div className="space-y-4">
                  {filteredSearchResults.map((result, index) => (
                    <div
                      key={index}
                      className="card dark:bg-gray-800 dark:border-gray-700 p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
                      onClick={() => handleAssetSelect(result.symbol)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {result.symbol}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{result.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(result.type)}`}>
                              {getFriendlyTypeName(result.type)}
                            </span>
                            {isBrazilianAsset(result) && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                🇧🇷 Brasil
                              </span>
                            )}
                          </div>
                          {result.exchange && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {result.exchange}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors">
                            <Star className="h-5 w-5" />
                          </button>
                          <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm && !loading ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum resultado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tente buscar com outros termos ou verifique a ortografia.
                </p>
                {selectedFilter !== 'all' && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Ou tente remover o filtro "{filters.find(f => f.value === selectedFilter)?.label}".
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-success-600" />
                  Ativos em Alta
                </h2>
                {trendingLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="card dark:bg-gray-800 dark:border-gray-700 p-4 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTrendingAssets.map((asset: AssetInfo, index: number) => (
                      <AssetCard
                        key={index}
                        symbol={asset.symbol}
                        onClick={() => setSelectedAsset(asset)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Asset Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedAsset ? (
              <div className="sticky top-8">
                <div className="card dark:bg-gray-800 dark:border-gray-700 p-8"> {/* Increased padding for larger card */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detalhes do Ativo
                    </h3>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                    >
                      ×
                    </button>
                  </div>
                  <AssetCard symbol={selectedAsset.symbol} />
                  {/* Main Indices Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Índices Principais</h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {['IBOVESPA', 'IFIX', 'SMLL', 'IDIV'].map((indice) => (
                        <div key={indice} className="card dark:bg-gray-700 dark:border-gray-600 p-1 text-center">
                          <AssetCard symbol={indice} compact={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Gráfico</h4>
                    <div className="h-96"> {/* Increased height for better visualization */}
                      <AdvancedTradingViewChart
                        symbol={selectedAsset?.symbol || ''}
                        height={500}
                      />
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <button className="btn-primary w-full">
                      Adicionar ao Portfólio
                    </button>
                    <button className="btn-secondary w-full">
                      Adicionar à Watchlist
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card dark:bg-gray-800 dark:border-gray-700 p-6">
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Selecione um Ativo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Clique em um ativo para ver os detalhes e gráficos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;