import React, { useEffect, useRef, memo } from 'react';
import { TradingViewConfig } from '../types';

interface TradingViewChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  timezone?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  withdateranges?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  save_image?: boolean;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  width = '100%',
  height = 400,
  interval = 'D',
  theme = 'light',
  style = '1',
  locale = 'pt_BR',
  timezone = 'America/Sao_Paulo',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  withdateranges = true,
  hide_side_toolbar = false,
  allow_symbol_change = true,
  save_image = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Limpar widget anterior se existir
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (error) {
        console.warn('Erro ao remover widget anterior:', error);
      }
    }

    // Limpar container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Função para criar o widget
    const createWidget = () => {
      if (!containerRef.current || !window.TradingView) {
        console.warn('TradingView não disponível ou container não encontrado');
        return;
      }

      try {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
          if (!containerRef.current) return;
          
          const config = {
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: timezone,
            theme: theme,
            style: style,
            locale: locale,
            toolbar_bg: toolbar_bg,
            enable_publishing: enable_publishing,
            withdateranges: withdateranges,
            hide_side_toolbar: hide_side_toolbar,
            allow_symbol_change: allow_symbol_change,
            save_image: save_image,
            container_id: containerRef.current.id,
            width: width,
            height: height,
          };

          widgetRef.current = new window.TradingView.widget(config);
        }, 100);
      } catch (error) {
        console.error('Erro ao criar widget TradingView:', error);
        // Mostrar mensagem de erro no container
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="text-align: center; color: #6c757d;">
                <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                <div>Gráfico indisponível</div>
                <div style="font-size: 12px; margin-top: 4px;">Erro ao carregar TradingView</div>
              </div>
            </div>
          `;
        }
      }
    };

    // Verificar se o script do TradingView já foi carregado
    if (window.TradingView) {
      createWidget();
    } else {
      // Verificar se já existe um script sendo carregado
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      
      if (existingScript) {
        // Script já existe, aguardar carregamento
        existingScript.addEventListener('load', createWidget);
      } else {
        // Carregar script do TradingView
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = createWidget;
        script.onerror = () => {
          console.error('Erro ao carregar script do TradingView');
          // Mostrar mensagem de erro
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
                <div style="text-align: center; color: #6c757d;">
                  <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                  <div>Erro de conexão</div>
                  <div style="font-size: 12px; margin-top: 4px;">Não foi possível carregar o TradingView</div>
                </div>
              </div>
            `;
          }
        };
        
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    }

    // Cleanup
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.warn('Erro ao limpar widget:', error);
        }
      }
    };
  }, [symbol, interval, theme, style, width, height]);

  // Gerar ID único para o container
  const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div
        ref={containerRef}
        id={containerId}
        className="tradingview-widget"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      />
      <div className="tradingview-widget-copyright">
        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          rel="noopener nofollow"
          target="_blank"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <span className="blue-text">{symbol}</span> por TradingView
        </a>
      </div>
    </div>
  );
};

// Componente simplificado para gráfico básico
export const SimpleTradingViewChart: React.FC<{
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
}> = ({ symbol, height = 300, theme = 'light' }) => {
  // Validação do símbolo
  if (!symbol || symbol.trim() === '') {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">Símbolo inválido</p>
        </div>
      </div>
    );
  }

  // Converter símbolos brasileiros para formato TradingView
  const formatSymbolForTradingView = (inputSymbol: string): string => {
    const cleanSymbol = inputSymbol.trim().toUpperCase();
    
    // Mapeamento de símbolos brasileiros
    const symbolMap: { [key: string]: string } = {
      'IBOVESPA': 'BMFBOVESPA:IBOV',
      'IFIX': 'BMFBOVESPA:IFIX',
      'SMLL': 'BMFBOVESPA:SMLL',
      'IDIV': 'BMFBOVESPA:IDIV',
      'BOVA11': 'BMFBOVESPA:BOVA11',
      'PETR4': 'BMFBOVESPA:PETR4',
      'VALE3': 'BMFBOVESPA:VALE3',
      'ITUB4': 'BMFBOVESPA:ITUB4',
      'BBDC4': 'BMFBOVESPA:BBDC4'
    };
    
    // Se o símbolo já tem prefixo, usar como está
    if (cleanSymbol.includes(':')) {
      return cleanSymbol;
    }
    
    // Se está no mapeamento, usar o valor mapeado
    if (symbolMap[cleanSymbol]) {
      return symbolMap[cleanSymbol];
    }
    
    // Se termina com .SA, converter para formato BMFBOVESPA
    if (cleanSymbol.endsWith('.SA')) {
      const baseSymbol = cleanSymbol.replace('.SA', '');
      return `BMFBOVESPA:${baseSymbol}`;
    }
    
    // Para outros símbolos brasileiros, assumir BMFBOVESPA
    if (cleanSymbol.match(/^[A-Z]{4}[0-9]{1,2}$/)) {
      return `BMFBOVESPA:${cleanSymbol}`;
    }
    
    // Retornar como está para símbolos internacionais
    return cleanSymbol;
  };

  const formattedSymbol = formatSymbolForTradingView(symbol);

  return (
    <TradingViewChart
      symbol={formattedSymbol}
      height={height}
      theme={theme}
      hide_side_toolbar={true}
      withdateranges={false}
      allow_symbol_change={false}
      save_image={false}
      enable_publishing={false}
    />
  );
};

// Componente para gráfico avançado
export const AdvancedTradingViewChart: React.FC<{
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
  interval?: string;
}> = ({ symbol, height = 500, theme = 'light', interval = 'D' }) => {
  return (
    <TradingViewChart
      symbol={symbol}
      height={height}
      theme={theme}
      interval={interval}
      hide_side_toolbar={false}
      withdateranges={true}
      allow_symbol_change={true}
      save_image={true}
      enable_publishing={false}
    />
  );
};

// Componente para mini gráfico
export const MiniTradingViewChart: React.FC<{
  symbol: string;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
}> = ({ symbol, width = 300, height = 200, theme = 'light' }) => {
  return (
    <TradingViewChart
      symbol={symbol}
      width={width}
      height={height}
      theme={theme}
      hide_side_toolbar={true}
      withdateranges={false}
      allow_symbol_change={false}
      save_image={false}
      enable_publishing={false}
      style="2" // Área
    />
  );
};

// Declaração de tipos para o TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (config: TradingViewConfig) => any;
    };
  }
}

export default memo(TradingViewChart);