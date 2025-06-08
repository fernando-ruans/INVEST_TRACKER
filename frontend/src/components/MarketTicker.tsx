import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { assetService } from '../services/api';
import { AssetInfo } from '../types';

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

const MarketTicker: React.FC<MarketTickerProps> = ({ className = '' }) => {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cache local para dados do ticker
  const tickerCache = useRef<{[key: string]: TickerItem}>({});
  
  // Usar dados em cache enquanto carrega
  useEffect(() => {
    // Recuperar cache do localStorage
    try {
      const cachedData = localStorage.getItem('tickerCache');
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        const cachedItems = Object.values(parsedCache) as TickerItem[];
        if (cachedItems.length > 0) {
          console.log('🎯 MarketTicker: Usando dados em cache enquanto carrega');
          setTickerData(cachedItems);
          setIsLoading(false);
          tickerCache.current = parsedCache;
        }
      }
    } catch (error) {
      console.warn('Erro ao recuperar cache do ticker:', error);
    }
  }, []);

  // Principais índices e ativos para o ticker (reduzido para melhor performance)
  const tickerSymbols = [
    '^BVSP', // Ibovespa
    'USDBRL=X', // Dólar
    'BTC-USD', // Bitcoin
    '^GSPC', // S&P 500
    'PETR4.SA', // Petrobras
    'VALE3.SA', // Vale
    'ITUB4.SA', // Itaú
    'BBDC4.SA' // Bradesco
  ];

  const loadTickerData = async () => {
    try {
      console.log('🎯 MarketTicker: Iniciando carregamento dos dados...');
      setIsLoading(true);
      
      // Função para carregar com timeout
      const loadWithTimeout = async (symbol: string, timeout = 5000): Promise<any> => {
        return Promise.race([
          assetService.getAssetInfo(symbol),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      };

      const promises = tickerSymbols.map(async (symbol): Promise<TickerItem | null> => {
        try {
          const data = await loadWithTimeout(symbol, 3000) as any; // 3 segundos de timeout
          return {
            symbol: data.symbol,
            name: data.name || symbol,
            price: data.price || 0,
            change: data.change || 0,
            changePercent: data.changePercent || 0
          };
        } catch (error) {
          console.warn(`❌ Timeout ou erro ao carregar ${symbol}`);
          return null;
        }
      });

      // Aguardar no máximo 8 segundos para todas as requisições
      const timeoutPromise = new Promise<TickerItem[]>((resolve) => {
        setTimeout(() => {
          console.log('⏰ Timeout geral atingido, usando dados parciais');
          resolve([]);
        }, 8000);
      });

      const raceResult = await Promise.race([
        Promise.all(promises),
        timeoutPromise
      ]) as (TickerItem | null)[];

      const validResults = raceResult.filter((item): item is TickerItem => item !== null);
       console.log(`🎯 MarketTicker: ${validResults.length} ativos carregados:`, validResults);
       
       if (validResults.length > 0) {
         setTickerData(validResults);
         
         // Atualizar cache
         const newCache: {[key: string]: TickerItem} = {};
         validResults.forEach(item => {
           newCache[item.symbol] = item;
         });
         tickerCache.current = { ...tickerCache.current, ...newCache };
         
         // Salvar no localStorage
         try {
           localStorage.setItem('tickerCache', JSON.stringify(tickerCache.current));
         } catch (error) {
           console.warn('Erro ao salvar cache do ticker:', error);
         }
       }
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados do ticker:', error);
    } finally {
      setIsLoading(false);
      console.log('🎯 MarketTicker: Carregamento finalizado');
    }
  };

  useEffect(() => {
    // Só carregar dados se não tiver cache válido
    if (tickerData.length === 0) {
      loadTickerData();
    }
    
    // Atualizar dados a cada 5 minutos (menos frequente)
    const dataInterval = setInterval(loadTickerData, 300000);
    
    return () => clearInterval(dataInterval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('BRL') || symbol.includes('USD')) {
      return price.toFixed(4);
    }
    if (symbol.includes('BTC') || symbol.includes('ETH')) {
      return price.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
    return price.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const getDisplayName = (name: string, symbol: string) => {
    const nameMap: { [key: string]: string } = {
      '^BVSP': 'IBOV',
      'BOVA11.SA': 'BOVA11',
      'USDBRL=X': 'USD/BRL',
      'EURBRL=X': 'EUR/BRL',
      'BTC-USD': 'Bitcoin',
      'ETH-USD': 'Ethereum',
      'GC=F': 'Ouro',
      'CL=F': 'Petróleo',
      '^GSPC': 'S&P 500',
      '^IXIC': 'Nasdaq',
      '^DJI': 'Dow Jones',
      'PETR4.SA': 'PETR4',
      'VALE3.SA': 'VALE3',
      'ITUB4.SA': 'ITUB4',
      'BBDC4.SA': 'BBDC4',
      'ABEV3.SA': 'ABEV3'
    };
    return nameMap[symbol] || name.substring(0, 10);
  };

  // Renderização instantânea: mostra ticker mesmo durante carregamento, se houver dados
  const hasData = tickerData.length > 0;
  // Duração da animação proporcional ao número de ativos (mínimo 18s)
  const animationDuration = Math.max(18, tickerData.length * 2.5);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}>
      {!hasData ? (
        isLoading ? (
          <div className="flex items-center justify-center py-3 sm:py-4">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Carregando dados do mercado...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 sm:py-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">📊 Dados de mercado indisponíveis no momento</div>
          </div>
        )
      ) : (
        <div className="ticker-container">
          <div className="ticker-content" style={{ animationDuration: `${animationDuration}s` }}>
            {[...tickerData, ...tickerData].map((item, index) => (
              <div key={`${item.symbol}-${index}`} className="ticker-item">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate max-w-20 sm:max-w-none">{getDisplayName(item.name, item.symbol)}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">({item.symbol})</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                    {formatPrice(item.price, item.symbol)}
                  </span>
                  <span className={`flex items-center text-xs sm:text-sm ${
                    item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.changePercent >= 0 ? (
                      <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    ) : (
                      <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    )}
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        .ticker-container {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
        }
        @media (min-width: 640px) {
          .ticker-container {
            height: 60px;
          }
        }
        .ticker-content {
          display: flex;
          animation: ticker-scroll linear infinite;
          will-change: transform;
        }
        .ticker-content:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          flex-shrink: 0;
          padding: 0 0.75rem;
          display: flex;
          align-items: center;
          height: 40px;
        }
        @media (min-width: 640px) {
          .ticker-item {
            padding: 0 2rem;
            height: 60px;
          }
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;