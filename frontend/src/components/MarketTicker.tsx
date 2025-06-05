import React, { useState, useEffect } from 'react';
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

  // Principais índices e ativos para o ticker
  const tickerSymbols = [
    '^BVSP', // Ibovespa
    'BOVA11.SA', // ETF Ibovespa
    'USDBRL=X', // Dólar
    'EURBRL=X', // Euro
    'BTC-USD', // Bitcoin
    'ETH-USD', // Ethereum
    'GC=F', // Ouro
    'CL=F', // Petróleo
    '^GSPC', // S&P 500
    '^IXIC', // Nasdaq
    '^DJI', // Dow Jones
    'PETR4.SA', // Petrobras
    'VALE3.SA', // Vale
    'ITUB4.SA', // Itaú
    'BBDC4.SA', // Bradesco
    'ABEV3.SA' // Ambev
  ];

  const loadTickerData = async () => {
    try {
      console.log('🎯 MarketTicker: Iniciando carregamento dos dados...');
      setIsLoading(true);
      const promises = tickerSymbols.map(async (symbol) => {
        try {
          console.log(`📊 Carregando dados para: ${symbol}`);
          const data = await assetService.getAssetInfo(symbol);
          console.log(`✅ Dados carregados para ${symbol}:`, data);
          return {
            symbol: data.symbol,
            name: data.name || symbol,
            price: data.price || 0,
            change: data.change || 0,
            changePercent: data.changePercent || 0
          };
        } catch (error) {
          console.warn(`❌ Erro ao carregar ${symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((item): item is TickerItem => item !== null);
      console.log(`🎯 MarketTicker: ${validResults.length} ativos carregados com sucesso:`, validResults);
      setTickerData(validResults);
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados do ticker:', error);
    } finally {
      setIsLoading(false);
      console.log('🎯 MarketTicker: Carregamento finalizado');
    }
  };

  useEffect(() => {
    loadTickerData();
    
    // Atualizar dados a cada 2 minutos
    const dataInterval = setInterval(loadTickerData, 120000);
    
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

  if (isLoading) {
    console.log('🎯 MarketTicker: Renderizando estado de carregamento...');
    return (
      <div className={`bg-gray-900 text-white py-4 overflow-hidden min-h-[60px] ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-lg font-medium">🔄 Carregando dados do mercado...</div>
        </div>
      </div>
    );
  }

  if (tickerData.length === 0) {
    console.log('🎯 MarketTicker: Renderizando estado sem dados...');
    return (
      <div className={`bg-gray-900 text-white py-4 overflow-hidden min-h-[60px] ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-400 font-medium">📊 Dados de mercado indisponíveis no momento</div>
        </div>
      </div>
    );
  }

  console.log('🎯 MarketTicker: Renderizando ticker com dados:', tickerData.length, 'ativos');

  return (
    <div className={`bg-gray-900 text-white py-4 overflow-hidden relative min-h-[60px] ${className}`}>
      <div className="ticker-container">
        <div className="ticker-content">
          {/* Duplicar os itens para criar o efeito contínuo */}
          {[...tickerData, ...tickerData, ...tickerData].map((item, index) => {
            const isPositive = item.change >= 0;
            return (
              <div key={`${item.symbol}-${index}`} className="ticker-item">
                <div className="flex items-center">
                  <span className="font-semibold text-sm mr-2">
                    {getDisplayName(item.name, item.symbol)}
                  </span>
                  <span className="text-sm text-gray-300 mr-2">
                    {formatPrice(item.price, item.symbol)}
                  </span>
                  <span className={`text-sm flex items-center mr-6 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* CSS para animação */}
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .ticker-container {
          width: 100%;
          white-space: nowrap;
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .ticker-content {
          display: inline-flex;
          animation: ticker-scroll 180s linear infinite;
          align-items: center;
        }
        
        .ticker-item {
          display: inline-flex;
          align-items: center;
          margin-right: 2rem;
          flex-shrink: 0;
          white-space: nowrap;
        }
        
        .ticker-container:hover .ticker-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;