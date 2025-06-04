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

### Execução Rápida (Comando Único)

**Para executar frontend e backend simultaneamente:**
```bash
# Instalar concurrently (apenas na primeira vez)
npm install

# Executar tudo com um comando
npm start
```

**Ou use o script PowerShell (Windows):**
```powershell
.\start.ps1
```

### Build para Produção (Comando Único)

**Para fazer build de tudo:**
```bash
npm run build
```

**Ou use o script PowerShell (Windows):**
```powershell
.\build.ps1
```

### Execução Manual (Separada)

#### Backend (FastAPI)

1. **Navegue para o diretório do backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Configure o banco de dados:**
```bash
python setup_database.py
```

4. **Execute o servidor:**
```bash
python -m uvicorn main:app --reload
```

O backend estará disponível em: http://localhost:8000
Documentação da API: http://localhost:8000/docs

#### Frontend (React)

1. **Navegue para o diretório do frontend:**
```bash
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
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

## 🚀 Deploy

Para instruções detalhadas de deploy, consulte:
- [Guia de Deploy Completo](DEPLOY_GUIDE.md)
- [Deploy no Render](RENDER_DEPLOY.md)
- [🚨 Correção de Erros no Render](RENDER_FIX.md) ⭐ **IMPORTANTE**

### ⚠️ Problemas no Render?

Se você recebeu erros como:
- `No module named uvicorn`
- `react-scripts: Permission denied`

**👉 Consulte o [RENDER_FIX.md](RENDER_FIX.md) para a solução completa!**

### Deploy Correto no Render

**🔧 Solução:** Deploy separado (recomendado)

1. **Backend (Web Service):**
   ```
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Frontend (Static Site):**
   ```
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

3. **Banco PostgreSQL:** Criar separadamente no Render

### Deploy Rápido (Alternativo)

Use o arquivo `render.yaml` para configuração automática:
```bash
# Commit o render.yaml e conecte o repositório
git add render.yaml
git commit -m "Add Render configuration"
git push
```

## 📝 Licença

MIT License