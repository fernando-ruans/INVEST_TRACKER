const axios = require('axios');

class AssetService {
  constructor() {
    this.alphaVantageBaseUrl = 'https://www.alphavantage.co/query';
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    // Fallback URLs for Yahoo Finance (as backup)
    this.yahooFinanceBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.yahooSearchUrl = 'https://query2.finance.yahoo.com/v1/finance/search';
    this.yahooQuoteUrl = 'https://query1.finance.yahoo.com/v7/finance/quote';
  }

  async getAssetInfoFromAlphaVantage(symbol) {
    try {
      // Get quote data from Alpha Vantage
      const response = await axios.get(this.alphaVantageBaseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageApiKey
        },
        timeout: 10000
      });

      const data = response.data;
      
      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        
        const price = parseFloat(quote['05. price']) || 0;
        const change = parseFloat(quote['09. change']) || 0;
        const changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0;
        
        return {
          symbol: quote['01. symbol'] || symbol,
          name: quote['01. symbol'] || symbol, // Alpha Vantage doesn't provide company name in GLOBAL_QUOTE
          price: price,
          change: change,
          changePercent: changePercent,
          volume: parseInt(quote['06. volume']) || 0,
          marketCap: null, // Not available in GLOBAL_QUOTE
          peRatio: null, // Not available in GLOBAL_QUOTE
          dividendYield: null, // Not available in GLOBAL_QUOTE
          fiftyTwoWeekHigh: parseFloat(quote['03. high']) || null,
          fiftyTwoWeekLow: parseFloat(quote['04. low']) || null,
          currency: 'USD', // Default currency
          exchange: 'Unknown', // Not available in GLOBAL_QUOTE
          marketState: 'REGULAR' // Default state
        };
      }
      
      return null; // No valid data found
    } catch (error) {
      console.error(`Alpha Vantage API error for ${symbol}:`, error.message);
      return null;
    }
  }

  // Get asset information from Brapi (Brazilian API for real market data)
  async getAssetInfoFromBrapi(symbol) {
    try {
      console.log(`Fetching real data for ${symbol} from Brapi...`);
      
      // Remove .SA suffix for Brapi API
      const cleanSymbol = symbol.replace('.SA', '');
      
      const response = await axios.get(`https://brapi.dev/api/quote/${cleanSymbol}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = response.data;
      
      if (!data.results || data.results.length === 0) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const quote = data.results[0];
      
      // Ensure we have valid price data
      if (!quote.regularMarketPrice && !quote.previousClose) {
        throw new Error(`No price data available for ${symbol}`);
      }
      
      const price = quote.regularMarketPrice || quote.previousClose || 0;
      const change = quote.regularMarketChange || 0;
      const changePercent = quote.regularMarketChangePercent || 0;
      
      const result = {
        symbol: quote.symbol || symbol,
        name: quote.longName || quote.shortName || quote.symbol || symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        change_percent: parseFloat(changePercent.toFixed(2)),
        volume: quote.regularMarketVolume || quote.averageVolume || 0,
        market_cap: quote.marketCap || null,
        pe_ratio: quote.priceEarningsRatio || null,
        dividend_yield: quote.dividendYield || null,
        fifty_two_week_high: quote.fiftyTwoWeekHigh || null,
        fifty_two_week_low: quote.fiftyTwoWeekLow || null,
        currency: quote.currency || 'BRL',
        exchange: quote.financialCurrency || 'B3',
        marketState: 'REGULAR'
      };
      
      console.log(`Successfully fetched real data for ${symbol}:`, result);
      return result;
      
    } catch (error) {
      console.error(`Brapi API error for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Get asset information from Yahoo Finance (improved method)
  async getAssetInfoFromYahoo(symbol) {
    const endpoints = [
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
      `https://finance.yahoo.com/quote/${symbol}/history?p=${symbol}`
    ];

    for (const url of endpoints) {
      try {
        console.log(`Trying Yahoo Finance endpoint: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          },
          timeout: 10000
        });

        console.log(`Yahoo Finance response status: ${response.status}`);
        
        if (!response.ok) {
          console.log(`Yahoo Finance endpoint failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`Yahoo Finance data received for ${symbol}`);
        
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
          console.log('No chart data found, trying next endpoint');
          continue;
        }

        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        
        if (!meta) {
          console.log('No meta data found, trying next endpoint');
          continue;
        }

        console.log(`Successfully got Yahoo Finance data for ${symbol}`);
        return {
          symbol: meta.symbol,
          name: meta.longName || meta.shortName || symbol,
          price: meta.regularMarketPrice || meta.previousClose || 0,
          currency: meta.currency || 'USD',
          change: meta.regularMarketPrice && meta.previousClose ? 
            meta.regularMarketPrice - meta.previousClose : 0,
          changePercent: meta.regularMarketPrice && meta.previousClose ? 
            ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 : 0,
          marketCap: meta.marketCap || null,
          volume: quote?.volume ? quote.volume[quote.volume.length - 1] : null,
          lastUpdated: new Date().toISOString(),
          source: 'Yahoo Finance'
        };
      } catch (error) {
        console.error(`Yahoo Finance endpoint ${url} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error(`All Yahoo Finance endpoints failed for ${symbol}`);
  }

  // Get asset information (prioritize Yahoo Finance for real data)
  async getAssetInfo(symbol) {
    try {
      // Use Yahoo Finance as primary source for real data
      console.log(`Trying Yahoo Finance for ${symbol}...`);
      const yahooData = await this.getAssetInfoFromYahoo(symbol);
      if (yahooData) {
        return yahooData;
      }
    } catch (error) {
      console.log(`Yahoo Finance failed for ${symbol}, trying Alpha Vantage...`);
    }

    try {
      // Fallback to Alpha Vantage if Yahoo fails
      const alphaVantageData = await this.getAssetInfoFromAlphaVantage(symbol);
      if (alphaVantageData) {
        console.log(`Using Alpha Vantage data for ${symbol}`);
        return alphaVantageData;
      }
    } catch (error) {
      console.error(`Alpha Vantage also failed for ${symbol}:`, error.message);
    }
    
    // If both APIs fail, throw error - no mock data
    throw new Error(`Failed to fetch real asset information for ${symbol}. Both Yahoo Finance and Alpha Vantage APIs are unavailable.`);
  }

  // Get historical data
  async getHistoricalData(symbol, period = '1y', interval = '1d') {
    try {
      const response = await axios.get(`${this.yahooFinanceBaseUrl}/${symbol}`, {
        params: {
          period1: this.getPeriodTimestamp(period),
          period2: Math.floor(Date.now() / 1000),
          interval: interval,
          events: 'div,splits'
        }
      });

      const data = response.data;
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('No historical data found');
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      const historicalData = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0
      })).filter(item => item.close > 0); // Filter out invalid data

      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  }

  // Search assets
  async searchAssets(query, limit = 10) {
    try {
      const response = await axios.get(this.yahooSearchUrl, {
        params: {
          q: query,
          quotesCount: limit,
          newsCount: 0
        }
      });

      const data = response.data;
      
      if (!data.quotes) {
        return [];
      }

      return data.quotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: quote.quoteType || 'EQUITY',
        exchange: quote.exchDisp || quote.exchange
      }));
    } catch (error) {
      console.error('Error searching assets:', error.message);
      throw new Error(`Failed to search assets: ${error.message}`);
    }
  }

  // Get market overview with real data
  async getMarketOverview() {
    try {
      console.log('Fetching real market indices data...');
      
      // Include Brazilian and international indices
      const indices = [
        // Brazilian indices
        '^BVSP',    // Ibovespa
        'IFIX.SA',  // IFIX (Real Estate)
        'SMLL.SA',  // Small Cap
        'IDIV.SA',  // Dividend Index
        
        // US indices
        '^GSPC',    // S&P 500
        '^DJI',     // Dow Jones
        '^IXIC',    // NASDAQ
        
        // European indices
        '^GDAXI',   // DAX
        '^FTSE',    // FTSE 100
        '^FCHI',    // CAC 40
        
        // Asian indices
        '^N225',    // Nikkei 225
        '^HSI',     // Hang Seng
        '000001.SS', // Shanghai Composite
        '^KS11'     // KOSPI
      ];
      
      const promises = indices.map(async (symbol) => {
        try {
          const result = await this.getAssetInfo(symbol);
          return {
            ...result,
            symbol: this.normalizeIndexSymbol(symbol),
            name: this.getIndexName(symbol)
          };
        } catch (error) {
          console.error(`Failed to fetch data for index ${symbol}:`, error.message);
          return null;
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      const successfulResults = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
      
      console.log(`Successfully fetched data for ${successfulResults.length}/${indices.length} indices`);
      
      if (successfulResults.length === 0) {
        console.log('No real index data available, falling back to mock data');
        return { indices: this.getMockMarketOverview() };
      }
      
      return { indices: successfulResults };
    } catch (error) {
      console.error('Error fetching market overview:', error.message);
      console.log('Falling back to mock market overview data');
      return { indices: this.getMockMarketOverview() };
    }
  }

  // Normalize index symbols for display
  normalizeIndexSymbol(symbol) {
    const symbolMap = {
      '^BVSP': 'IBOVESPA',
      'IFIX.SA': 'IFIX',
      'SMLL.SA': 'SMLL',
      'IDIV.SA': 'IDIV',
      '^GSPC': 'SPX',
      '^DJI': 'DJI',
      '^IXIC': 'IXIC',
      '^GDAXI': 'DAX',
      '^FTSE': 'UKX',
      '^FCHI': 'CAC',
      '^N225': 'NKY',
      '^HSI': 'HSI',
      '000001.SS': 'SHCOMP',
      '^KS11': 'KOSPI'
    };
    
    return symbolMap[symbol] || symbol;
  }

  // Get index display names
  getIndexName(symbol) {
    const nameMap = {
      '^BVSP': 'Ibovespa',
      'IFIX.SA': 'IFIX',
      'SMLL.SA': 'Small Cap',
      'IDIV.SA': 'Dividend Index',
      '^GSPC': 'S&P 500',
      '^DJI': 'Dow Jones',
      '^IXIC': 'NASDAQ',
      '^GDAXI': 'DAX',
      '^FTSE': 'FTSE 100',
      '^FCHI': 'CAC 40',
      '^N225': 'Nikkei 225',
      '^HSI': 'Hang Seng',
      '000001.SS': 'Shanghai Composite',
      '^KS11': 'KOSPI'
    };
    
    return nameMap[symbol] || symbol;
  }

  // Mock market overview data
  getMockMarketOverview() {
    const baseValues = {
      'NKY': { price: 28000, change: 150, name: 'Nikkei 225' },
      'HSI': { price: 24500, change: -120, name: 'Hang Seng' },
      'SHCOMP': { price: 3200, change: 25, name: 'Shanghai Composite' },
      'KOSPI': { price: 2450, change: 18, name: 'KOSPI' }
    };

    return Object.entries(baseValues).map(([symbol, data]) => ({
      symbol,
      name: data.name,
      price: data.price + Math.floor(Math.random() * 100) - 50, // Add some variation
      change: data.change + Math.floor(Math.random() * 20) - 10,
      change_percent: ((data.change + Math.floor(Math.random() * 20) - 10) / data.price * 100).toFixed(2),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      market_cap: null,
      pe_ratio: null,
      dividend_yield: null,
      currency: 'USD',
      exchange: 'Various',
      market_state: 'REGULAR',
      day_high: data.price + Math.floor(Math.random() * 50),
      day_low: data.price - Math.floor(Math.random() * 50)
    }));
  }

  // Get trending assets
  async getTrendingAssets(limit = 10) {
    try {
      const trendingSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
      const promises = trendingSymbols.slice(0, limit).map(symbol => this.getAssetInfo(symbol));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Error fetching trending assets:', error.message);
      throw new Error(`Failed to fetch trending assets: ${error.message}`);
    }
  }

  // Get multiple assets info (real data only)
  async getMultipleAssetsInfo(symbols) {
    try {
      if (!symbols || symbols.length === 0) {
        return [];
      }

      console.log(`Getting real market data for symbols: ${symbols.join(', ')}`);

      // Get real data for each symbol - no fallbacks
      const promises = symbols.map(async (symbol) => {
        try {
          const result = await this.getAssetInfo(symbol);
          console.log(`Successfully fetched real data for ${symbol}:`, result);
          return result;
        } catch (error) {
          console.error(`Failed to get real data for ${symbol}:`, error.message);
          return null; // Return null for failed requests
        }
      });
      
      const results = await Promise.all(promises);
      
      // Filter out failed requests and format the successful ones
      const finalResults = results
        .filter(result => result !== null)
        .map(result => {
          const mappedResult = {
            symbol: result.symbol,
            name: result.name,
            price: parseFloat((result.price || 0).toFixed(2)),
            change: parseFloat((result.change || 0).toFixed(2)),
            change_percent: parseFloat((result.changePercent || result.change_percent || 0).toFixed(2)),
            volume: result.volume || 0,
            market_cap: result.marketCap || result.market_cap || null,
            currency: result.currency || 'BRL'
          };
          console.log(`Real market data for ${result.symbol}:`, mappedResult);
          return mappedResult;
        });
      
      console.log(`Successfully fetched real data for ${finalResults.length}/${symbols.length} symbols`);
      return finalResults;
    } catch (error) {
      console.error('Error fetching multiple assets info:', error.message);
      throw new Error(`Failed to fetch real market data: ${error.message}`);
    }
  }

  // Helper method to convert period to timestamp
  getPeriodTimestamp(period) {
    const now = Math.floor(Date.now() / 1000);
    const periods = {
      '1d': 24 * 60 * 60,
      '5d': 5 * 24 * 60 * 60,
      '1mo': 30 * 24 * 60 * 60,
      '3mo': 90 * 24 * 60 * 60,
      '6mo': 180 * 24 * 60 * 60,
      '1y': 365 * 24 * 60 * 60,
      '2y': 2 * 365 * 24 * 60 * 60,
      '5y': 5 * 365 * 24 * 60 * 60,
      '10y': 10 * 365 * 24 * 60 * 60,
      'ytd': now - new Date(new Date().getFullYear(), 0, 1).getTime() / 1000,
      'max': 50 * 365 * 24 * 60 * 60 // 50 years
    };

    return now - (periods[period] || periods['1y']);
  }
}

module.exports = AssetService;