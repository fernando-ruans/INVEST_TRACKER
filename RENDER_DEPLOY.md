# Investment Tracker - Deploy no Render

Guia específico para fazer deploy da aplicação Investment Tracker no Render.

## 🚀 Configuração do Backend (FastAPI)

### 1. Arquivo de Build Script
Crie um arquivo `build.sh` na raiz do projeto backend:

```bash
#!/usr/bin/env bash
# build.sh

# Instalar dependências
pip install -r requirements.txt

# Criar diretório de uploads
mkdir -p uploads/avatars

# Executar migrações se necessário
python setup_database.py
```

### 2. Configurações no Render (Backend)

**Configurações Básicas:**
- **Environment:** Python 3
- **Build Command:** `./build.sh`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `backend`

**Variáveis de Ambiente:**
```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
SECRET_KEY=sua_chave_secreta_muito_longa_e_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=10000
```

### 3. Modificações Necessárias no Backend

#### main.py - Configuração de CORS e Porta
```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(title="Investment Tracker API")

# Configurar CORS para produção
origins = [
    "https://seu-frontend.onrender.com",  # Substituir pela URL do frontend
    "http://localhost:3000",  # Para desenvolvimento
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar diretório de uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Servir arquivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Suas rotas aqui...
```

#### requirements.txt - Adicionar Gunicorn
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
```

## 🌐 Configuração do Frontend (React)

### 1. Configurações no Render (Frontend)

**Configurações Básicas:**
- **Environment:** Static Site
- **Build Command:** `npm run build`
- **Publish Directory:** `build`
- **Root Directory:** `frontend`

**Variáveis de Ambiente:**
```env
REACT_APP_API_URL=https://seu-backend.onrender.com/api
```

### 2. Arquivo _redirects
Crie um arquivo `public/_redirects` para SPA routing:

```
/*    /index.html   200
```

### 3. Modificações no Frontend

#### src/services/api.ts - URL Base Dinâmica
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

## 🗄️ Configuração do Banco de Dados

### Opção 1: PostgreSQL no Render

1. **Criar PostgreSQL Database no Render**
2. **Copiar a URL de conexão**
3. **Configurar variável DATABASE_URL no backend**

### Opção 2: PostgreSQL Externo (Supabase, ElephantSQL)

1. **Criar conta no provedor escolhido**
2. **Criar banco de dados**
3. **Executar o schema:**
```bash
psql -h host -U usuario -d database -f database_schema.sql
```

## 📋 Checklist de Deploy

### Backend
- [ ] Arquivo `build.sh` criado
- [ ] `requirements.txt` atualizado com gunicorn
- [ ] CORS configurado com URL do frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e configurado
- [ ] Schema do banco executado

### Frontend
- [ ] Arquivo `_redirects` criado
- [ ] `REACT_APP_API_URL` configurada
- [ ] Build testado localmente
- [ ] URLs de API atualizadas

## 🔧 Scripts Úteis

### build.sh (Backend)
```bash
#!/usr/bin/env bash
set -o errexit

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios necessários
mkdir -p uploads/avatars

# Executar setup do banco (se necessário)
if [ "$SETUP_DB" = "true" ]; then
    python setup_database.py
fi

echo "Build concluído com sucesso!"
```

### package.json - Scripts de Build
```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:render": "npm install && npm run build"
  }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de CORS:**
   - Verificar se a URL do frontend está nas origins do CORS
   - Confirmar se não há trailing slash nas URLs

2. **Erro de Banco de Dados:**
   - Verificar se DATABASE_URL está correta
   - Confirmar se o banco foi criado
   - Executar o schema manualmente se necessário

3. **Erro de Build:**
   - Verificar se todas as dependências estão no requirements.txt
   - Confirmar se o arquivo build.sh tem permissões de execução

4. **Erro de Roteamento (Frontend):**
   - Verificar se o arquivo `_redirects` existe
   - Confirmar se está na pasta `public`

### Logs Úteis

```bash
# Ver logs do backend
render logs --service=seu-backend-service

# Ver logs do frontend
render logs --service=seu-frontend-service
```

## 🔐 Segurança em Produção

1. **Usar HTTPS sempre**
2. **Configurar SECRET_KEY única e segura**
3. **Usar senhas fortes para banco de dados**
4. **Configurar CORS restritivamente**
5. **Não expor informações sensíveis nos logs**

## 📊 Monitoramento

1. **Configurar health checks**
2. **Monitorar logs de erro**
3. **Configurar alertas de uptime**
4. **Monitorar uso de recursos**

## 🔄 Atualizações

Para atualizar a aplicação:
1. **Push para o repositório Git**
2. **Render fará deploy automático**
3. **Verificar logs para confirmar sucesso**
4. **Testar funcionalidades críticas**

---

**Dica:** Mantenha sempre um backup dos dados antes de fazer deploy em produção usando o script `backup_database.py`.