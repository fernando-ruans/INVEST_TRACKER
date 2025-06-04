# 🚨 Correção dos Erros no Render

## Problemas Identificados

1. **Backend:** `No module named uvicorn` - dependências Python não instaladas
2. **Frontend:** `react-scripts: Permission denied` - problemas de permissão
3. **Arquitetura:** Tentativa de executar frontend e backend no mesmo serviço

## ✅ Solução: Deploy Separado

O Render funciona melhor com **serviços separados** para backend e frontend.

### 🐍 Backend (Web Service)

**1. Criar novo Web Service no Render:**
- Repository: `https://github.com/fernando-ruans/INVEST_TRACKER`
- Root Directory: `backend`
- Runtime: `Python 3`

**2. Configurações do Backend:**
```
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
Root Directory: backend
```

**3. Variáveis de Ambiente (Backend):**
```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
SECRET_KEY=sua_chave_secreta_muito_longa_e_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://seu-frontend.onrender.com
```

### ⚛️ Frontend (Static Site)

**1. Criar novo Static Site no Render:**
- Repository: `https://github.com/fernando-ruans/INVEST_TRACKER`
- Root Directory: `frontend`

**2. Configurações do Frontend:**
```
Build Command: npm install --legacy-peer-deps && npm run build
Publish Directory: build
Root Directory: frontend
```

**3. Variáveis de Ambiente (Frontend):**
```env
REACT_APP_API_URL=https://seu-backend.onrender.com/api
```

## 🔧 Arquivos Necessários

### Backend: requirements.txt
Verifique se contém:
```txt
fastapi>=0.100.0
uvicorn==0.24.0
gunicorn==21.2.0
# ... outras dependências
```

### Frontend: package.json
Verifique se os scripts estão corretos:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🗄️ Banco de Dados

**1. Criar PostgreSQL no Render:**
- Vá em Dashboard > New > PostgreSQL
- Copie a URL de conexão
- Configure no backend como `DATABASE_URL`

**2. Executar Schema:**
```bash
# Conectar ao banco e executar
psql $DATABASE_URL -f database_schema.sql
```

## 📋 Checklist de Deploy

### Preparação
- [ ] Commit e push das correções
- [ ] Criar PostgreSQL database no Render
- [ ] Anotar URLs que serão geradas

### Backend
- [ ] Criar Web Service
- [ ] Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Configurar variáveis de ambiente
- [ ] Executar schema do banco

### Frontend
- [ ] Criar Static Site
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `build`
- [ ] Configurar `REACT_APP_API_URL`

### Finalização
- [ ] Atualizar CORS no backend com URL real do frontend
- [ ] Testar endpoints da API
- [ ] Testar aplicação frontend

## 🚨 Erros Comuns e Soluções

### "No module named uvicorn"
**Causa:** Dependências não instaladas
**Solução:** Verificar `requirements.txt` e build command

### "react-scripts: Permission denied"
**Causa:** Tentativa de executar dev server em produção
**Solução:** Usar Static Site com build command correto

### "ERESOLVE could not resolve" (React Dependencies)
**Causa:** Conflito entre React 18 e react-tradingview-widget que requer React 16
**Solução:** 
- Usar `--legacy-peer-deps` no build command
- Arquivo `.npmrc` criado automaticamente
- Build Command: `npm install --legacy-peer-deps && npm run build`

### "CORS Error"
**Causa:** URLs não configuradas no CORS
**Solução:** Atualizar `main.py` com URLs reais

### "Database connection failed"
**Causa:** `DATABASE_URL` incorreta
**Solução:** Verificar string de conexão do PostgreSQL

## 🔄 Comandos Úteis

### Logs do Backend
```bash
# Ver logs em tempo real
render logs --service=seu-backend-service
```

### Logs do Frontend
```bash
# Ver logs de build
render logs --service=seu-frontend-service
```

### Conectar ao Banco
```bash
# Conectar via psql
psql $DATABASE_URL
```

## 📝 URLs Finais

Após o deploy:
- **Backend:** `https://seu-backend.onrender.com`
- **Frontend:** `https://seu-frontend.onrender.com`
- **API Docs:** `https://seu-backend.onrender.com/docs`

## ⚡ Deploy Local vs Produção

**Desenvolvimento (Local):**
```bash
npm start  # Executa ambos simultaneamente
```

**Produção (Render):**
- Backend e Frontend em serviços separados
- Cada um com suas próprias configurações
- Comunicação via URLs públicas

---

**💡 Dica:** Sempre teste localmente antes de fazer deploy. Use `npm start` para desenvolvimento e os comandos específicos do Render para produção.