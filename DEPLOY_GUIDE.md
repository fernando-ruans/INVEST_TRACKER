# Investment Tracker - Guia de Deploy

Este guia contém todas as informações necessárias para fazer o deploy da aplicação Investment Tracker.

## 📋 Pré-requisitos

### Backend
- Python 3.8+
- PostgreSQL 12+ (recomendado para produção)
- pip (gerenciador de pacotes Python)

### Frontend
- Node.js 16+
- npm ou yarn

## 🗄️ Configuração do Banco de Dados

### Opção 1: Script SQL (Recomendado para produção)

1. **Criar banco de dados PostgreSQL:**
```sql
CREATE DATABASE investment_tracker;
CREATE USER investment_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE investment_tracker TO investment_user;
```

2. **Executar o script de schema:**
```bash
psql -U investment_user -d investment_tracker -f database_schema.sql
```

### Opção 2: Script Python (Desenvolvimento/Teste)

1. **Configurar variáveis de ambiente:**
```bash
cp backend/.env.example backend/.env
```

2. **Editar o arquivo .env:**
```env
DATABASE_URL=postgresql://investment_user:sua_senha@localhost/investment_tracker
SECRET_KEY=sua_chave_secreta_muito_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

3. **Executar o script de setup:**
```bash
python setup_database.py
```

## 🚀 Deploy do Backend

### 1. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente
Crie o arquivo `.env` com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# Segurança
SECRET_KEY=sua_chave_secreta_muito_longa_e_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (opcional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app
FROM_EMAIL=seu_email@gmail.com
```

### 3. Executar em produção

**Com Uvicorn:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Com Gunicorn (recomendado):**
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🌐 Deploy do Frontend

### 1. Instalar dependências
```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente
Crie o arquivo `.env` no diretório frontend:

```env
REACT_APP_API_URL=https://seu-backend.com/api
```

### 3. Build para produção
```bash
npm run build
```

### 4. Servir arquivos estáticos

**Com serve:**
```bash
npm install -g serve
serve -s build -l 3000
```

**Com nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        root /caminho/para/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐳 Deploy com Docker

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: investment_tracker
      POSTGRES_USER: investment_user
      POSTGRES_PASSWORD: senha_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://investment_user:senha_segura@db:5432/investment_tracker
      SECRET_KEY: sua_chave_secreta
    depends_on:
      - db
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 📊 Schema do Banco de Dados

### Tabelas Principais

1. **users** - Usuários do sistema
   - Campos: id, email, username, full_name, hashed_password, avatar, is_active, is_verified
   - Relacionamentos: portfolios, watchlists

2. **portfolios** - Portfólios de investimento
   - Campos: id, name, description, user_id
   - Relacionamentos: user, assets

3. **portfolio_assets** - Ativos dos portfólios
   - Campos: id, portfolio_id, symbol, quantity, average_price

4. **watchlists** - Listas de observação
   - Campos: id, name, user_id
   - Relacionamentos: user, items

5. **watchlist_items** - Itens das watchlists
   - Campos: id, watchlist_id, symbol, name

6. **user_verifications** - Verificações de email
   - Campos: id, user_id, verification_code, expires_at, verified_at

7. **password_resets** - Reset de senhas
   - Campos: id, user_id, reset_code, expires_at, used_at

## 🔧 Configurações de Produção

### Segurança
- Use HTTPS em produção
- Configure CORS adequadamente
- Use senhas fortes para banco de dados
- Mantenha SECRET_KEY segura e única
- Configure rate limiting

### Performance
- Use connection pooling para banco de dados
- Configure cache (Redis)
- Use CDN para arquivos estáticos
- Configure compressão gzip

### Monitoramento
- Configure logs estruturados
- Use ferramentas de monitoramento (Sentry, DataDog)
- Configure health checks
- Monitore métricas de performance

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verifique DATABASE_URL
   - Confirme se o PostgreSQL está rodando
   - Verifique credenciais

2. **Erro de CORS:**
   - Configure origins permitidas no backend
   - Verifique URL do frontend

3. **Erro de upload de avatar:**
   - Verifique permissões do diretório uploads
   - Confirme se o diretório existe

4. **Erro de autenticação:**
   - Verifique SECRET_KEY
   - Confirme configuração de tokens

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs da aplicação
2. Consulte este guia
3. Verifique as configurações de ambiente
4. Execute o script de diagnóstico: `python setup_database.py`