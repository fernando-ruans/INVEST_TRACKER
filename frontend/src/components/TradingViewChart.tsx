import React, { useEffect, useRef, memo } from 'react';
import TradingViewWidget from 'react-tradingview-widget';
import { useTheme } from '../contexts/ThemeContext';
import { suppressTradingViewErrors } from '../utils/errorSuppression';

// Converter símbolos brasileiros para formato TradingView
const formatSymbolForTradingView = (inputSymbol: string): string => {
  const cleanSymbol = inputSymbol.trim().toUpperCase();
  const symbolMap: { [key: string]: string } = {
    'IBOVESPA': 'BMFBOVESPA:IBOV',
    'IFIX': 'BMFBOVESPA:IFIX',
    'SMLL': 'BMFBOVESPA:SMLL',
    'IDIV': 'BMFBOVESPA:IDIV',
    'BOVA11': 'BMFBOVESPA:BOVA11',
    'PETR4': 'BMFBOVESPA:PETR4',
    'VALE3': 'BMFBOVESPA:VALE3',
    'ITUB4': 'BMFBOVESPA:ITUB4',
    'BBDC4': 'BMFBOVESPA:BBDC4',
    'GC=F': 'COMEX:GC1!',
    'SI=F': 'COMEX:SI1!',
    'PL=F': 'NYMEX:PL1!',
    'PA=F': 'NYMEX:PA1!',
    'CL=F': 'NYMEX:CL1!',
    'BZ=F': 'ICE:BRN1!',
    'NG=F': 'NYMEX:NG1!',
    'HG=F': 'COMEX:HG1!',
    'ZC=F': 'CBOT:ZC1!',
    'ZS=F': 'CBOT:ZS1!',
    'ZW=F': 'CBOT:ZW1!',
    'KC=F': 'ICEUS:KC1!',
    'SB=F': 'ICEUS:SB1!',
    'CC=F': 'ICEUS:CC1!',
    'CT=F': 'ICEUS:CT1!',
    'OJ=F': 'ICEUS:OJ1!',
    'LBS=F': 'CME:LBS1!',
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
    'BNB-USD': 'BINANCE:BNBUSDT',
    'ADA-USD': 'BINANCE:ADAUSDT',
    'SOL-USD': 'BINANCE:SOLUSDT',
    'XRP-USD': 'BINANCE:XRPUSDT',
    'DOT-USD': 'BINANCE:DOTUSDT',
    'DOGE-USD': 'BINANCE:DOGEUSDT',
    'AVAX-USD': 'BINANCE:AVAXUSDT',
    'MATIC-USD': 'BINANCE:MATICUSDT',
    'EURUSD=X': 'FX:EURUSD',
    'GBPUSD=X': 'FX:GBPUSD',
    'USDJPY=X': 'FX:USDJPY',
    'USDCAD=X': 'FX:USDCAD',
    'AUDUSD=X': 'FX:AUDUSD',
    'USDBRL=X': 'FX:USDBRL',
    'EURBRL=X': 'FX:EURBRL',
    '^GSPC': 'SP:SPX',
    '^DJI': 'DJ:DJI',
    '^IXIC': 'NASDAQ:IXIC',
    '^FTSE': 'FTSE:UKX',
    '^GDAXI': 'XETR:DAX',
    '^N225': 'TVC:NI225',
    '^HSI': 'HSI:HSI',
    '^TNX': 'TVC:TNX',
    '^FVX': 'TVC:FVX',
    '^IRX': 'TVC:IRX',
    '^TYX': 'TVC:TYX',
    'USDCHF=X': 'FX:USDCHF',
    'NZDUSD=X': 'FX:NZDUSD',
    'EURJPY=X': 'FX:EURJPY',
    'GBPJPY=X': 'FX:GBPJPY',
    'EURGBP=X': 'FX:EURGBP',
    'WDO=F': 'BMFBOVESPA:WDO1!',
    'DOL=F': 'BMFBOVESPA:DOL1!',
    'WIN=F': 'BMFBOVESPA:WIN1!',
    'IND=F': 'BMFBOVESPA:IND1!',
    'BGI=F': 'BMFBOVESPA:BGI1!',
    'CCM=F': 'BMFBOVESPA:CCM1!',
    'ICF=F': 'BMFBOVESPA:ICF1!',
    'DI1=F': 'BMFBOVESPA:DI11!'
  };
  if (cleanSymbol.includes(':')) return cleanSymbol;
  if (symbolMap[cleanSymbol]) return symbolMap[cleanSymbol];
  if (cleanSymbol.endsWith('.SA')) return `BMFBOVESPA:${cleanSymbol.replace('.SA', '')}`;
  if (cleanSymbol.match(/^[A-Z]{4}[0-9]{1,2}$/)) return `BMFBOVESPA:${cleanSymbol}`;
  return cleanSymbol;
};

// Interface para configuração do TradingView
export interface TradingViewConfig {
  autosize?: boolean;
  symbol: string;
  interval: string;
  theme: 'light' | 'dark';
  style: string;
  locale: string;
  timezone: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  withdateranges: boolean;
  hide_side_toolbar: boolean;
  allow_symbol_change: boolean;
  save_image: boolean;
  container_id: string;
  width: string | number;
  height: string | number;
  fullscreen?: boolean;
  studies_overrides?: any;
  overrides?: any;
  calendar?: boolean;
  details?: boolean;
  hotlist?: boolean;
  news?: string[];
  watchlist?: any[];
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
  studies?: string[];
  hide_volume?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  range?: string;
}

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
  fullscreen?: boolean;
  studies?: string[];
  hide_volume?: boolean;
  range?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  width = '100%',
  height = 400,
  interval = 'D',
  theme,
  style = '1',
  locale = 'pt_BR',
  timezone = 'America/Sao_Paulo',
  toolbar_bg,
  enable_publishing = false,
  withdateranges = true,
  hide_side_toolbar = false,
  allow_symbol_change = true,
  save_image = true,
  className = '',
  fullscreen = true,
  studies = [],
  hide_volume = false,
  range = '',
}) => {
  const { theme: contextTheme } = useTheme();
  const currentTheme = theme || contextTheme;
  const currentToolbarBg = toolbar_bg || (contextTheme === 'dark' ? '#1f2937' : '#f1f3f6');
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
        return;
      }

      try {
        setTimeout(() => {
          if (!containerRef.current) return;
          
          // Verificar se o ambiente é válido
          if (typeof window === 'undefined' || !window.TradingView) {
            return;
          }
          
          const config = {
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: timezone,
            theme: currentTheme,
            style: style,
            locale: locale,
            toolbar_bg: currentToolbarBg,
            enable_publishing: enable_publishing,
            withdateranges: withdateranges,
            hide_side_toolbar: hide_side_toolbar,
            allow_symbol_change: allow_symbol_change,
            save_image: save_image,
            container_id: containerRef.current.id,
            width: width,
            height: height,
            fullscreen: fullscreen,
            studies_overrides: {
              "volume.volume.color.0": "#00FFFF",
              "volume.volume.color.1": "#0000FF",
              "volume.volume.transparency": 70,
              "volume.options.showStudyArguments": true,
            },
            overrides: {
              "paneProperties.background": currentTheme === 'dark' ? "#1e1e1e" : "#ffffff",
              "paneProperties.vertGridProperties.color": currentTheme === 'dark' ? "#363c4e" : "#f0f3fa",
              "paneProperties.horzGridProperties.color": currentTheme === 'dark' ? "#363c4e" : "#f0f3fa",
              "symbolWatermarkProperties.transparency": 90,
              "scalesProperties.textColor": currentTheme === 'dark' ? "#d1d4dc" : "#787b86",
              "mainSeriesProperties.candleStyle.upColor": "#26a69a",
              "mainSeriesProperties.candleStyle.downColor": "#ef5350",
              "mainSeriesProperties.candleStyle.drawWick": true,
              "mainSeriesProperties.candleStyle.drawBorder": true,
              "mainSeriesProperties.candleStyle.borderColor": "#378658",
              "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
              "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
              "volumePaneSize": "medium",
            },
            calendar: true,
            details: true,
            hotlist: true,
            news: ["headlines"],
            watchlist: [],
            show_popup_button: true,
            popup_width: "1000",
            popup_height: "650",
            studies: studies.length > 0 ? studies : [
              "Volume@tv-basicstudies",
              "MACD@tv-basicstudies",
              "RSI@tv-basicstudies",
              "BB@tv-basicstudies"
            ],
            hide_volume: hide_volume,
            hide_top_toolbar: false,
            hide_legend: false,
            range: range || "12M",
          };
          // Suprimir erros de console do TradingView usando utilitário centralizado
          const stopSuppression = suppressTradingViewErrors(15000); // 15 segundos

          widgetRef.current = new window.TradingView.widget(config);
          
          // Cleanup será feito automaticamente pelo utilitário
        }, 100);
      } catch (error: any) {
        // Silenciar erros relacionados ao TradingView
        if (!error?.message?.includes('Invalid environment') && 
            !error?.message?.includes('contentWindow')) {
          console.error('Erro ao criar widget TradingView:', error);
        }
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

    if (window.TradingView) {
      createWidget();
    } else {
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', createWidget);
      } else {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = createWidget;
        script.onerror = () => {
          // Silenciar erro de carregamento se for relacionado ao ambiente
          if (typeof window !== 'undefined') {
            console.error('Erro ao carregar script do TradingView');
          }
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
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.warn('Erro ao limpar widget:', error);
        }
      }
    };
  }, [symbol, interval, currentTheme, style, width, height]);

  const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

  return (
    <div className={`tradingview-widget-container ${className}`} style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        id={containerId}
        className="tradingview-widget"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          background: contextTheme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: 8,
          minHeight: 320,
        }}
      />
      <div className="tradingview-widget-copyright">
        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          rel="noopener nofollow"
          target="_blank"
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
}> = ({ symbol, height = 300, theme }) => {
  // Validação do símbolo
  if (!symbol || symbol.trim() === '') {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500 dark:text-gray-400">Símbolo inválido</p>
        </div>
      </div>
    );
  }

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
}

// Componente para gráfico avançado
export const AdvancedTradingViewChart: React.FC<{
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
  interval?: string;
}> = ({ symbol, height = 600, theme, interval = 'D' }) => {
  const formattedSymbol = formatSymbolForTradingView(symbol);
  const fallbackSymbol = 'BINANCE:BTCUSDT';
  
  return (
    <TradingViewChart
      symbol={formattedSymbol || fallbackSymbol}
      height={height}
      theme={theme}
      interval={interval}
      hide_side_toolbar={false}
      withdateranges={true}
      allow_symbol_change={true}
      save_image={true}
      enable_publishing={false}
      studies={[
        "Volume@tv-basicstudies",
        "MACD@tv-basicstudies",
        "RSI@tv-basicstudies",
        "BB@tv-basicstudies",
        "MA@tv-basicstudies",
        "EMA@tv-basicstudies"
      ]}
      hide_volume={false}
      range="12M"
    />
  );
};

// Componente para mini gráfico
export const MiniTradingViewChart: React.FC<{
  symbol: string;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
}> = ({ symbol, width = 300, height = 200, theme }) => {
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