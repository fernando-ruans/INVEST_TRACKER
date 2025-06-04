from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import secrets

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Gerar SECRET_KEY se não existir
if not os.getenv("SECRET_KEY"):
    print("Aviso: SECRET_KEY não encontrada no arquivo .env. Gerando uma nova chave temporária.")
    # Esta chave será regenerada a cada reinício do servidor
    # Em produção, defina uma chave fixa no arquivo .env
from app.database.database import engine, Base
from app.api.routes.assets import router as assets_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.news import router as news_router
from app.api.routes.calendar import router as calendar_router
from app.api.routes.auth import router as auth_router

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Investment Tracker API",
    description="API para rastreamento de investimentos e análise de ativos financeiros",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(assets_router, prefix="/api/assets", tags=["assets"])
app.include_router(portfolio_router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(news_router, prefix="/api/news", tags=["news"])
app.include_router(calendar_router, prefix="/api/calendar", tags=["calendar"])

@app.get("/")
async def root():
    return {"message": "Investment Tracker API", "version": "1.0.0"}