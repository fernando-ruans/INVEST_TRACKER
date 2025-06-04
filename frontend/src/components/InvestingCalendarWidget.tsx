import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Hook para detectar o tamanho da tela
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface InvestingCalendarWidgetProps {
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  timeZone?: string;
  timeSpan?: 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek';
  showCountries?: string[];
  importanceLevel?: 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high
  className?: string;
}

const InvestingCalendarWidget: React.FC<InvestingCalendarWidgetProps> = ({
  width = '100%',
  height,
  theme,
  timeZone = 'America/Sao_Paulo',
  timeSpan = 'thisWeek',
  showCountries = ['BR', 'US', 'EU', 'GB', 'CN', 'JP'],
  importanceLevel = 3,
  className = '',
}) => {
  const { theme: contextTheme } = useTheme();
  const currentTheme = theme || contextTheme;
  const { width: screenWidth } = useWindowSize();
  
  // Calcula a altura responsiva se não for fornecida
  const responsiveHeight = height || (screenWidth < 640 ? 400 : 
                                     screenWidth < 768 ? 500 : 
                                     screenWidth < 1024 ? 600 : 800);
  
  // URL do widget econômico do TradingView
  // Usando o widget oficial em vez do iframe direto para evitar problemas de X-Frame-Options
  const widgetId = `tradingview-widget-${Math.random().toString(36).substring(2, 15)}`;
  
  // Configuração do widget
  const widgetConfig = {
    "colorTheme": currentTheme === 'dark' ? 'dark' : 'light',
    "isTransparent": false,
    "width": "100%",
    "height": "100%",
    "locale": "pt",
    "importanceFilter": importanceLevel.toString(),
    "currencyFilter": "USD,EUR,BRL,GBP,CNY,JPY"
  };
  
  // Configuração em formato de string para o script
  const widgetConfigString = JSON.stringify(widgetConfig);


  // Referência para o contêiner do widget
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Limpar qualquer conteúdo anterior
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Criar a estrutura do widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.id = widgetId;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';

    // Criar o script do TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = widgetConfigString;

    // Montar a estrutura
    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    // Adicionar ao DOM
    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
    }

    // Limpar ao desmontar
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetId, widgetConfigString]);

  return (
    <div className={`investing-calendar-widget-container ${className}`} style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        className="investing-calendar-widget"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof responsiveHeight === 'number' ? `${responsiveHeight}px` : responsiveHeight,
          background: contextTheme === 'dark' ? '#1f2937' : '#fff',
          borderRadius: 8,
          minHeight: screenWidth < 640 ? 300 : 400,
          overflow: 'hidden',
        }}
      />
      <div className="investing-widget-copyright">
        <a
          href="https://www.tradingview.com/economic-calendar/"
          rel="noopener nofollow"
          target="_blank"
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Calendário Econômico por TradingView
        </a>
      </div>
    </div>
  );
};

export default InvestingCalendarWidget;