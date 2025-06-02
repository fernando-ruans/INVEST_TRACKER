from .assets import router as assets_router
from .portfolio import router as portfolio_router
from .news import router as news_router
from .calendar import router as calendar_router

__all__ = [
    "assets_router",
    "portfolio_router", 
    "news_router",
    "calendar_router"
]