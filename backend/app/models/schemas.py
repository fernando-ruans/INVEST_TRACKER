from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Schemas para Assets
class AssetInfo(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None

class HistoricalData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class AssetSearch(BaseModel):
    symbol: str
    name: str
    type: str
    exchange: Optional[str] = None

# Schemas para Portfolio
class PortfolioAssetCreate(BaseModel):
    symbol: str
    quantity: float
    average_price: float

class PortfolioAssetUpdate(BaseModel):
    quantity: Optional[float] = None
    average_price: Optional[float] = None

class PortfolioAssetResponse(BaseModel):
    id: int
    symbol: str
    quantity: float
    average_price: float
    current_price: Optional[float] = None
    total_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None
    
    class Config:
        from_attributes = True

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class PortfolioResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    total_value: Optional[float] = None
    total_profit_loss: Optional[float] = None
    total_profit_loss_percent: Optional[float] = None
    assets: List[PortfolioAssetResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para News
class NewsItem(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    published_at: datetime
    source: str
    image_url: Optional[str] = None

# Schemas para Calendar
class EconomicEvent(BaseModel):
    date: datetime
    time: Optional[str] = None
    event: str
    country: str
    importance: str  # High, Medium, Low
    actual: Optional[str] = None
    forecast: Optional[str] = None
    previous: Optional[str] = None

# Schemas para Watchlist
class WatchlistAdd(BaseModel):
    symbol: str
    name: Optional[str] = None

class WatchlistItem(BaseModel):
    id: int
    symbol: str
    name: Optional[str] = None
    current_price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    added_at: datetime
    
    class Config:
        from_attributes = True