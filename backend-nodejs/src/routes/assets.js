const express = require('express');
const { query, validationResult } = require('express-validator');
const AssetService = require('../services/assetService');
const { optionalAuth } = require('../middleware/auth');

const assetService = new AssetService();

const router = express.Router();

// Get asset information
router.get('/info/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const assetInfo = await assetService.getAssetInfo(symbol.toUpperCase());
    
    res.json({
      success: true,
      data: assetInfo
    });
  } catch (error) {
    console.error('Get asset info error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get historical data
router.get('/historical/:symbol', [
  query('period').optional().isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']),
  query('interval').optional().isIn(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'])
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const { period = '1y', interval = '1d' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const historicalData = await assetService.getHistoricalData(symbol.toUpperCase(), period, interval);
    
    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    console.error('Get historical data error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Search assets
router.get('/search', [
  query('query').notEmpty().trim(),
  query('limit').optional().isInt({ min: 1, max: 50 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { query: searchQuery, limit = 10 } = req.query;
    
    const searchResults = await assetService.searchAssets(searchQuery, parseInt(limit));
    
    res.json({
      success: true,
      data: searchResults
    });
  } catch (error) {
    console.error('Search assets error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get market overview
router.get('/market-overview', optionalAuth, async (req, res) => {
  try {
    const marketData = await assetService.getMarketOverview();
    
    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Get market overview error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get trending assets
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const trendingAssets = await assetService.getTrendingAssets();
    
    res.json({
      success: true,
      data: trendingAssets
    });
  } catch (error) {
    console.error('Get trending assets error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get multiple assets info
router.post('/batch-info', [
  query('symbols').optional().isArray({ min: 1, max: 50 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required'
      });
    }

    const upperCaseSymbols = symbols.map(symbol => symbol.toUpperCase());
    const assetsInfo = await assetService.getMultipleAssetsInfo(upperCaseSymbols);
    
    res.json({
      success: true,
      data: assetsInfo
    });
  } catch (error) {
    console.error('Get multiple assets info error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get asset price only (lightweight endpoint)
router.get('/price/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }

    const assetInfo = await assetService.getAssetInfo(symbol.toUpperCase());
    
    res.json({
      success: true,
      data: {
        symbol: assetInfo.symbol,
        price: assetInfo.price,
        change: assetInfo.change,
        change_percent: assetInfo.change_percent
      }
    });
  } catch (error) {
    console.error('Get asset price error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;