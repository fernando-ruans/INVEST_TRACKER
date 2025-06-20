import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import { assetService } from '../services/api';
import { AssetSearchResult } from '../types';

interface AssetSearchProps {
  onAssetSelect: (asset: AssetSearchResult) => void;
  placeholder?: string;
  className?: string;
  showTrending?: boolean;
  maxResults?: number;
}

const AssetSearch: React.FC<AssetSearchProps> = ({
  onAssetSelect,
  placeholder = "Buscar ações, ETFs, criptomoedas...",
  className = "",
  showTrending = true,
  maxResults = 8
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [trendingAssets, setTrendingAssets] = useState<AssetSearchResult[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Buscar ativos trending ao montar o componente
  useEffect(() => {
    if (showTrending) {
      loadTrendingAssets();
    }
  }, [showTrending]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar ativos em alta
  const loadTrendingAssets = async () => {
    try {
      const trending = await assetService.getTrendingAssets(6);
      const trendingResults: AssetSearchResult[] = trending.map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.name,
        type: 'stock',
        exchange: asset.exchange,
        currency: asset.currency,
        sector: asset.sector
      }));
      setTrendingAssets(trendingResults);
    } catch (error) {
      console.error('Erro ao carregar ativos trending:', error);
    }
  };

  // Buscar ativos com debounce
  const searchAssets = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await assetService.searchAssets(searchQuery, maxResults);
      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manipular mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);

    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Criar novo timeout para debounce
    debounceRef.current = setTimeout(() => {
      searchAssets(value);
    }, 300);
  };

  // Manipular teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentResults = query.trim() ? results : trendingAssets;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          handleAssetSelect(currentResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Manipular seleção de ativo
  const handleAssetSelect = (asset: AssetSearchResult) => {
    onAssetSelect(asset);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Limpar busca
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Obter ícone do tipo de ativo
  const getAssetTypeIcon = (type: string) => {
    if (!type) return '📈';
    switch (type.toLowerCase()) {
      case 'crypto':
        return '₿';
      case 'etf':
        return '📊';
      case 'forex':
        return '💱';
      case 'commodity':
        return '🥇';
      default:
        return '📈';
    }
  };

  // Obter cor do tipo de ativo
  const getAssetTypeColor = (type: string) => {
    if (!type) return 'text-gray-600';
    switch (type.toLowerCase()) {
      case 'crypto':
        return 'text-orange-600';
      case 'etf':
        return 'text-blue-600';
      case 'forex':
        return 'text-green-600';
      case 'commodity':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const currentResults = query.trim() ? results : trendingAssets;
  const showResults = isOpen && (currentResults.length > 0 || isLoading);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-300" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-80 sm:max-h-96 rounded-md py-1 text-sm sm:text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 overflow-auto focus:outline-none">
          {/* Header para trending */}
          {!query.trim() && showTrending && trendingAssets.length > 0 && (
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 flex items-center">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Em Alta
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary-600 mr-2"></div>
              Buscando...
            </div>
          )}

          {/* Resultados */}
          {currentResults.map((asset, index) => (
            <button
              key={`${asset.symbol}-${asset.exchange}`}
              onClick={() => handleAssetSelect(asset)}
              className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                index === selectedIndex ? 'bg-primary-50 dark:bg-primary-900/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <span className="text-sm sm:text-lg flex-shrink-0">{getAssetTypeIcon(asset.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{asset.symbol}</span>
                      <span className={`text-xs px-1 sm:px-2 py-0.5 rounded-full ${getAssetTypeColor(asset.type)} bg-gray-100 dark:bg-gray-700 hidden sm:inline`}>
                        {asset.type ? asset.type.toUpperCase() : 'STOCK'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {asset.name}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{asset.exchange}</div>
                  {asset.currency && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{asset.currency}</div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Nenhum resultado */}
          {!isLoading && query.trim() && results.length === 0 && (
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Nenhum ativo encontrado para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetSearch;