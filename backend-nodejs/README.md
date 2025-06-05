# Investment Tracker Backend - Node.js

Backend em Node.js para o Investment Tracker, uma aplicação de rastreamento de investimentos e análise de ativos financeiros.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Axios** - Cliente HTTP para APIs externas
- **Multer** - Upload de arquivos
- **Express Validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- npm 8+
- PostgreSQL 12+

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd INVEST_TRACKER/backend-nodejs
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://username:password@localhost/investment_tracker
JWT_SECRET=your-super-secret-jwt-key
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. **Configure o banco de dados**

Crie o banco de dados PostgreSQL:
```sql
CREATE DATABASE investment_tracker;
```

5. **Inicie o servidor**

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:8000`

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/avatar` - Upload de avatar
- `PUT /api/auth/password` - Alterar senha

### Assets
- `GET /api/assets/info/:symbol` - Informações do ativo
- `GET /api/assets/historical/:symbol` - Dados históricos
- `GET /api/assets/search` - Buscar ativos
- `GET /api/assets/market-overview` - Visão geral do mercado
- `GET /api/assets/trending` - Ativos em alta
- `POST /api/assets/batch-info` - Informações de múltiplos ativos
- `GET /api/assets/price/:symbol` - Preço atual do ativo

### Portfolio
- `GET /api/portfolio` - Listar portfolios
- `POST /api/portfolio` - Criar portfolio
- `GET /api/portfolio/:id` - Obter portfolio específico
- `PUT /api/portfolio/:id` - Atualizar portfolio
- `DELETE /api/portfolio/:id` - Excluir portfolio
- `POST /api/portfolio/:id/assets` - Adicionar ativo ao portfolio
- `PUT /api/portfolio/:portfolioId/assets/:assetId` - Atualizar ativo
- `DELETE /api/portfolio/:portfolioId/assets/:assetId` - Remover ativo

### Watchlist
- `GET /api/portfolio/watchlist/all` - Obter watchlist
- `POST /api/portfolio/watchlist` - Adicionar à watchlist
- `DELETE /api/portfolio/watchlist/:id` - Remover da watchlist

### Notícias
- `GET /api/news` - Notícias financeiras
- `GET /api/news/symbol/:symbol` - Notícias por ativo
- `GET /api/news/search` - Buscar notícias
- `GET /api/news/trending` - Notícias em destaque

### Calendário Econômico
- `GET /api/calendar/events` - Eventos econômicos
- `GET /api/calendar/today` - Eventos de hoje
- `GET /api/calendar/week` - Eventos da semana
- `GET /api/calendar/high-impact` - Eventos de alto impacto
- `GET /api/calendar/country/:country` - Eventos por país
- `GET /api/calendar/holidays` - Feriados do mercado

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **portfolios** - Portfolios de investimento
- **portfolio_assets** - Ativos nos portfolios
- **watchlist** - Lista de ativos observados
- **email_verifications** - Verificações de email
- **password_resets** - Redefinições de senha

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <token>
```

## 📊 Fontes de Dados

- **Yahoo Finance API** - Dados de ativos e preços
- **Mock Data** - Notícias e calendário econômico (para demonstração)

## 🚀 Deploy

### Render.com

1. Conecte seu repositório ao Render
2. Configure as variáveis de ambiente
3. Use o comando de build: `npm install`
4. Use o comando de start: `npm start`

### Heroku

1. Instale o Heroku CLI
2. Faça login: `heroku login`
3. Crie a aplicação: `heroku create your-app-name`
4. Configure as variáveis: `heroku config:set DATABASE_URL=...`
5. Deploy: `git push heroku main`

## 🧪 Testes

```bash
npm test
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm test` - Executa os testes
- `npm run build` - Comando de build (não necessário para Node.js)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

## 🔄 Migração do Python

Este backend Node.js é uma reimplementação do backend Python original (FastAPI). As principais diferenças:

- **Framework**: Express.js ao invés de FastAPI
- **ORM**: Sequelize ao invés de SQLAlchemy
- **Validação**: Express Validator ao invés de Pydantic
- **Estrutura**: Mais modular e organizada
- **Performance**: Melhor para I/O intensivo
- **Deploy**: Mais fácil em plataformas como Render e Heroku

Todas as funcionalidades do backend Python foram mantidas e algumas melhorias foram adicionadas.