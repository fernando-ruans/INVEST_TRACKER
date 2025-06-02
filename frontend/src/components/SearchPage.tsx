import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Star, BarChart3 } from 'lucide-react';
import { assetService } from '../services/api';
import { AssetSearchResult, AssetInfo } from '../types';
import AssetCard from './AssetCard';
import { SimpleTradingViewChart } from './TradingViewChart';

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
    { value: 'stocks', label: 'Ações' },
    { value: 'crypto', label: 'Criptomoedas' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodities', label: 'Commodities' },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar Ativos</h1>
          <p className="text-gray-600">
            Encontre e analise ações, criptomoedas, forex e commodities.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input pl-10"
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
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Filtrar por:</span>
                <div className="flex space-x-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedFilter === filter.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Resultados da Busca ({searchResults.length})
                </h2>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
                      onClick={() => handleAssetSelect(result.symbol)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {result.symbol}
                              </h3>
                              <p className="text-sm text-gray-600">{result.name}</p>
                            </div>
                            <span className="badge-secondary">{result.type}</span>
                          </div>
                          {result.exchange && (
                            <p className="text-xs text-gray-500 mt-1">
                              {result.exchange}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                            <Star className="h-5 w-5" />
                          </button>
                          <BarChart3 className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm && !loading ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente buscar com outros termos ou verifique a ortografia.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-success-600" />
                  Ativos em Alta
                </h2>
                {trendingLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="card p-4 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingAssets.map((asset, index) => (
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
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detalhes do Ativo
                    </h3>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <AssetCard symbol={selectedAsset.symbol} />
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Gráfico</h4>
                    <div className="h-64">
                      <SimpleTradingViewChart
                        symbol={selectedAsset.symbol}
                        height={256}
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
              <div className="card p-6">
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Selecione um Ativo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
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