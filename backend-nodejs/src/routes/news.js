const express = require('express');
const { query, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const newsService = require('../services/newsService');

const router = express.Router();

// Get financial news
router.get('/', [
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
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

    const { category = 'general', limit = 20, page = 1 } = req.query;
    
    const news = await newsService.getFinancialNews(category, parseInt(limit), parseInt(page));
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get news by symbol
router.get('/symbol/:symbol', [
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

    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    
    const news = await newsService.getNewsBySymbol(symbol, parseInt(limit));
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by symbol error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get news by asset
router.get('/asset/:symbol', [
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

    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    
    const news = await newsService.getNewsBySymbol(symbol, parseInt(limit));
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get asset news error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Search news
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { q: query, limit = 20 } = req.query;
    
    const news = await newsService.searchNews(query, parseInt(limit));
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Search news error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get news categories
router.get('/categories', optionalAuth, async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'Geral' },
      { id: 'Technology', name: 'Tecnologia' },
      { id: 'Healthcare', name: 'Saúde' },
      { id: 'Finance', name: 'Financeiro' },
      { id: 'Markets', name: 'Mercados' },
      { id: 'Economy', name: 'Economia' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;