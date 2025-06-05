const axios = require('axios');
const Parser = require('rss-parser');

class NewsService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'enclosure']
      }
    });
    
    // RSS feeds organizados por categoria com fontes brasileiras e internacionais
    this.rssFeeds = {
      general: [
        // Fontes brasileiras
        'https://www.infomoney.com.br/feed/',
        'https://valor.globo.com/rss/',
        'https://www.moneytimes.com.br/feed/',
        'https://exame.com/feed/',
        // Fontes internacionais
        'https://feeds.finance.yahoo.com/rss/2.0/headline',
        'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        'https://www.marketwatch.com/rss/topstories'
      ],
      stocks: [
        // Fontes brasileiras
        'https://www.infomoney.com.br/mercados/feed/',
        'https://valor.globo.com/financas/rss/',
        'https://www.moneytimes.com.br/mercados/feed/',
        // Fontes internacionais
        'https://feeds.finance.yahoo.com/rss/2.0/headline',
        'https://www.cnbc.com/id/100727362/device/rss/rss.html'
      ],
      crypto: [
        // Fontes brasileiras
        'https://www.infomoney.com.br/colunistas/moedas-digitais/feed/',
        'https://livecoins.com.br/feed/',
        // Fontes internacionais
        'https://www.coindesk.com/arc/outboundfeeds/rss/',
        'https://cointelegraph.com/rss'
      ],
      technology: [
        // Fontes brasileiras
        'https://exame.com/tecnologia/feed/',
        'https://www.infomoney.com.br/negocios/tecnologia/feed/',
        // Fontes internacionais
        'https://techcrunch.com/feed/'
      ],
      economy: [
        // Fontes brasileiras
        'https://valor.globo.com/brasil/rss/',
        'https://www.infomoney.com.br/economia/feed/',
        'https://exame.com/economia/feed/',
        // Fontes internacionais
        'https://www.reuters.com/business/finance/rss'
      ]
    };
  }

  // Get financial news from RSS feeds
  async getFinancialNews(category = 'general', limit = 20, page = 1) {
    try {
      console.log(`Fetching news from RSS feeds for category: ${category}`);
      
      // Get RSS feeds for the specified category
      const feeds = this.rssFeeds[category] || this.rssFeeds.general;
      const allNews = [];
      
      // Fetch news from multiple RSS feeds concurrently
      const feedPromises = feeds.map(async (feedUrl) => {
        try {
          console.log(`Fetching from: ${feedUrl}`);
          const feed = await this.parser.parseURL(feedUrl);
          
          return feed.items.map(item => ({
            title: item.title || 'Sem título',
            description: this.cleanDescription(item.contentSnippet || item.content || item.summary || item.title),
            url: item.link,
            published_at: item.pubDate || item.isoDate || new Date().toISOString(),
            source: this.extractSourceName(feedUrl, feed.title),
            image_url: this.extractImageUrl(item) || `https://via.placeholder.com/400x200?text=Notícias+Financeiras`,
            category: this.categorizeNews(item.title + ' ' + (item.contentSnippet || '')),
            sentiment: 'Neutral'
          }));
        } catch (feedError) {
          console.error(`Error fetching feed ${feedUrl}:`, feedError.message);
          return [];
        }
      });
      
      const feedResults = await Promise.all(feedPromises);
      
      // Flatten and combine all news
      feedResults.forEach(newsArray => {
        allNews.push(...newsArray);
      });
      
      if (allNews.length === 0) {
        console.log('No news found from RSS feeds');
        return [];
      }
      
      // Sort by publication date (newest first)
      allNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      
      // Remove duplicates based on title similarity
      const uniqueNews = this.removeDuplicates(allNews);
      
      console.log(`Successfully fetched ${uniqueNews.length} unique news articles from RSS feeds`);
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return uniqueNews.slice(startIndex, endIndex);
      
    } catch (error) {
      console.error('Error fetching news from RSS feeds:', error.message);
      return [];
    }
  }

  // Clean and truncate description
  cleanDescription(description) {
    if (!description) return '';
    
    // Remove HTML tags
    const cleanText = description.replace(/<[^>]*>/g, '').trim();
    
    // Truncate to reasonable length
    return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
  }
  
  // Extract source name from feed URL or title
  extractSourceName(feedUrl, feedTitle) {
    const sourceMap = {
      'infomoney.com.br': 'InfoMoney',
      'valor.globo.com': 'Valor Econômico',
      'moneytimes.com.br': 'Money Times',
      'exame.com': 'Exame',
      'livecoins.com.br': 'LiveCoins',
      'finance.yahoo.com': 'Yahoo Finance',
      'cnbc.com': 'CNBC',
      'marketwatch.com': 'MarketWatch',
      'coindesk.com': 'CoinDesk',
      'cointelegraph.com': 'Cointelegraph',
      'techcrunch.com': 'TechCrunch',
      'reuters.com': 'Reuters'
    };
    
    for (const [domain, name] of Object.entries(sourceMap)) {
      if (feedUrl.includes(domain)) {
        return name;
      }
    }
    
    return feedTitle || 'Fonte Desconhecida';
  }
  
  // Extract image URL from RSS item
  extractImageUrl(item) {
    // Try different possible image fields
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url;
    }
    
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    
    // Look for images in content
    if (item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        return imgMatch[1];
      }
    }
    
    return null;
  }
  
  // Remove duplicate news based on title similarity
  removeDuplicates(newsArray) {
    const seen = new Set();
    return newsArray.filter(news => {
      // Create a normalized version of the title for comparison
      const normalizedTitle = news.title.toLowerCase()
        .replace(/[^a-záàâãéèêíìîóòôõúùûç\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (seen.has(normalizedTitle)) {
        return false;
      }
      
      seen.add(normalizedTitle);
      return true;
    });
  }
  
  // Categorize news based on content
  categorizeNews(content) {
    const categories = {
      'Technology': ['tech', 'tecnologia', 'ai', 'software', 'digital', 'cyber', 'innovation', 'inovação'],
      'Energy': ['oil', 'gas', 'energy', 'energia', 'renewable', 'solar', 'wind', 'petróleo'],
      'Healthcare': ['health', 'pharma', 'medical', 'drug', 'biotech', 'saúde', 'medicina'],
      'Finance': ['bank', 'financial', 'credit', 'loan', 'investment', 'banco', 'financeiro', 'crédito', 'empréstimo', 'investimento'],
      'Markets': ['market', 'trading', 'stock', 'share', 'index', 'mercado', 'ação', 'ações', 'bolsa', 'índice'],
      'Economy': ['economic', 'gdp', 'inflation', 'employment', 'fed', 'economia', 'pib', 'inflação', 'emprego', 'bc', 'banco central'],
      'Crypto': ['bitcoin', 'crypto', 'cryptocurrency', 'blockchain', 'ethereum', 'moeda digital', 'criptomoeda']
    };
    
    const lowerContent = content.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  }

  // Search news by query
  async searchNews(query, limit = 20) {
    try {
      console.log(`Searching news with query: ${query}`);
      
      // Get all news from all categories
      const allNews = [];
      
      // Fetch news from all RSS feed categories
      for (const category of Object.keys(this.rssFeeds)) {
        try {
          const categoryNews = await this.getFinancialNews(category, 50, 1);
          allNews.push(...categoryNews);
        } catch (error) {
          console.error(`Error fetching news from category ${category}:`, error.message);
        }
      }
      
      // Remove duplicates
      const uniqueNews = this.removeDuplicates(allNews);
      
      // Filter news based on search query
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      const filteredNews = uniqueNews.filter(news => {
        const searchableContent = (
          news.title + ' ' + 
          (news.description || '') + ' ' + 
          (news.source || '') + ' ' + 
          (news.category || '')
        ).toLowerCase();
        
        // Check if any search term is found in the content
        return searchTerms.some(term => searchableContent.includes(term));
      });
      
      // Sort by date (newest first) and limit results
      const sortedNews = filteredNews
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, limit);
      
      console.log(`Found ${sortedNews.length} news articles matching query: ${query}`);
      
      return sortedNews;
    } catch (error) {
      console.error('Error searching news:', error.message);
      throw new Error(`Failed to search news: ${error.message}`);
    }
  }

}

module.exports = new NewsService();