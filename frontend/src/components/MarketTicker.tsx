import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { assetService } from '../services/api';

interface MarketTickerProps {
  className?: string;
}

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Lista de símbolos para buscar dados reais
const tickerSymbols = [
  'IBOV', 'USD', 'EUR', 'BTC', 'ETH', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3',
  'MGLU3', 'WEGE3', 'SUZB3', 'RENT3', 'LREN3', 'JBSS3', 'RADL3', 'GGBR4', 'CSNA3', 'VIVT3'
];

// Dados iniciais para carregamento (serão substituídos por dados reais)
const initialTickerData: TickerItem[] = [
  { symbol: 'IBOV', name: 'Ibovespa', price: 0, change: 0, changePercent: 0 },
  { symbol: 'USD', name: 'Dólar', price: 0, change: 0, changePercent: 0 },
  { symbol: 'EUR', name: 'Euro', price: 0, change: 0, changePercent: 0 },
  { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, changePercent: 0 },
  { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, changePercent: 0 },
  { symbol: 'PETR4', name: 'Petrobras', price: 0, change: 0, changePercent: 0 },
  { symbol: 'VALE3', name: 'Vale', price: 0, change: 0, changePercent: 0 },
  { symbol: 'ITUB4', name: 'Itaú', price: 0, change: 0, changePercent: 0 },
  { symbol: 'BBDC4', name: 'Bradesco', price: 0, change: 0, changePercent: 0 },
  { symbol: 'ABEV3', name: 'Ambev', price: 0, change: 0, changePercent: 0 },
  { symbol: 'MGLU3', name: 'Magazine Luiza', price: 0, change: 0, changePercent: 0 },
  { symbol: 'WEGE3', name: 'WEG', price: 0, change: 0, changePercent: 0 },
  { symbol: 'SUZB3', name: 'Suzano', price: 0, change: 0, changePercent: 0 },
  { symbol: 'RENT3', name: 'Localiza', price: 0, change: 0, changePercent: 0 },
  { symbol: 'LREN3', name: 'Lojas Renner', price: 0, change: 0, changePercent: 0 },
  { symbol: 'JBSS3', name: 'JBS', price: 0, change: 0, changePercent: 0 },
  { symbol: 'RADL3', name: 'Raia Drogasil', price: 0, change: 0, changePercent: 0 },
  { symbol: 'GGBR4', name: 'Gerdau', price: 0, change: 0, changePercent: 0 },
  { symbol: 'CSNA3', name: 'CSN', price: 0, change: 0, changePercent: 0 },
  { symbol: 'VIVT3', name: 'Vivo', price: 0, change: 0, changePercent: 0 }
];

const MarketTicker: React.FC<MarketTickerProps> = ({ className = '' }) => {
  const [tickerData, setTickerData] = useState<TickerItem[]>(initialTickerData);
  const [loading, setLoading] = useState(true);
  
  // Função para buscar dados reais da API
  const fetchRealData = async () => {
    try {
      const promises = tickerSymbols.map(async (symbol) => {
        try {
          const assetInfo = await assetService.getAssetInfo(symbol);
          return {
            symbol: assetInfo.symbol,
            name: assetInfo.name,
            price: assetInfo.price,
            change: assetInfo.change,
            changePercent: assetInfo.changePercent
          };
        } catch (error) {
          console.warn(`Erro ao buscar dados para ${symbol}:`, error);
          // Retorna null para filtrar ativos sem dados reais
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      // Filtrar apenas ativos com dados reais (remover nulls)
      const realData = results.filter(item => item !== null) as TickerItem[];
      
      if (realData.length === 0) {
        console.warn('Nenhum dado real disponível no momento');
        setTickerData([{ symbol: 'INFO', name: 'Dados indisponíveis', price: 0, change: 0, changePercent: 0 }]);
      } else {
        setTickerData(realData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do ticker:', error);
      setLoading(false);
    }
  };
  
  // Carregar dados iniciais e configurar atualizações periódicas
  useEffect(() => {
    // Buscar dados imediatamente
    fetchRealData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchRealData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'USD') return `R$ ${price.toFixed(2)}`;
    if (symbol === 'EUR') return `R$ ${price.toFixed(2)}`;
    if (symbol === 'BTC') return `$ ${price.toLocaleString()}`;
    if (symbol === 'ETH') return `$ ${price.toLocaleString()}`;
    if (symbol === 'IBOV') return price.toFixed(0);
    return `R$ ${price.toFixed(2)}`;
  };

  const renderTickerItem = (item: TickerItem, key: string) => (
    <div key={key} className="ticker-item">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {item.symbol}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
          {formatPrice(item.price, item.symbol)}
        </span>
        <span className={`flex items-center text-sm font-medium ${
          item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {item.changePercent >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );

  // Criar múltiplas cópias para scroll infinito perfeito usando dados dinâmicos
  const infiniteContent = useMemo(() => {
    if (!tickerData || tickerData.length === 0) return [];
    
    const copies = [];
    // Criar 4 cópias completas de todos os dados para scroll suave
    for (let i = 0; i < 4; i++) {
      copies.push(
        ...tickerData.map((item, index) => 
          renderTickerItem(item, `${item.symbol}-copy-${i}-${index}`)
        )
      );
    }
    return copies;
  }, [tickerData]);

  if (loading) {
    return (
      <div className={`relative overflow-hidden bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Carregando dados do mercado...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="ticker-container">
        {infiniteContent}
      </div>
      
      <style>
        {`
          .ticker-container {
            display: flex;
            animation: scroll-infinite 25s linear infinite;
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: transform;
            transform: translateZ(0);
          }
          
          .ticker-item {
            flex-shrink: 0;
            padding: 12px 24px;
            white-space: nowrap;
            transition: none;
            transform: translateZ(0);
          }
          
          @keyframes scroll-infinite {
            0% { transform: translateX(0); }
            100% { transform: translateX(-25%); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .ticker-container {
              animation: scroll-infinite 25s linear infinite !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MarketTicker;