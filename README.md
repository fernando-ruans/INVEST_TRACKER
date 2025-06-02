# Investment Tracker - Aplicativo de Análise de Ativos Financeiros

Um aplicativo web completo para análise de ativos financeiros com gráficos interativos, gestão de carteiras e notícias do mercado.

## 🚀 Funcionalidades

### 🔍 1. Visualização de Ativos Financeiros
- Gráficos candlestick interativos com TradingView Charting Library
- Zoom e rolagem
- Múltiplos intervalos de tempo (1D, 1W, 1M, etc.)
- Indicadores técnicos nativos (RSI, MACD, SMA, Bollinger, etc.)
- Integração com Yahoo Finance via yfinance

### 💡 2. Busca e Consulta de Ativos
- Busca de qualquer ativo listado no Yahoo Finance
- Suporte a ações, ETFs, moedas, criptos e índices
- Dados históricos em tempo real

### 💼 3. Montagem de Carteiras
- Criação de carteiras personalizadas
- Gestão de quantidade, preço médio e valor total
- Cálculo de desempenho agregado em tempo real

### 📰 4. Notícias
- Feed de notícias financeiras gerais
- Notícias específicas dos ativos da carteira
- Integração com APIs de notícias

### 📅 5. Calendário Econômico
- Eventos econômicos importantes
- Indicadores como juros, inflação, PIB
- Integração com fontes públicas

## 🛠️ Tecnologias

### Frontend
- **React** com TypeScript
- **TradingView Charting Library** para gráficos
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP

### Backend
- **Python** com **FastAPI**
- **yfinance** para dados do Yahoo Finance
- **SQLite** para armazenamento local
- **Uvicorn** como servidor ASGI

## 📁 Estrutura do Projeto

```
INVEST_TRACKER/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilitários
│   ├── public/
│   └── package.json
├── backend/                 # API Python
│   ├── app/
│   │   ├── api/            # Rotas da API
│   │   ├── models/         # Modelos de dados
│   │   ├── services/       # Serviços de negócio
│   │   └── database/       # Configuração do banco
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🚀 Como Executar

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 APIs Utilizadas

- **Yahoo Finance** (via yfinance) - Dados de ativos
- **News API** - Notícias financeiras
- **Trading Economics** - Calendário econômico

## 🔧 Configuração

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Instale as dependências do backend e frontend
4. Execute os servidores

## 📝 Licença

MIT License