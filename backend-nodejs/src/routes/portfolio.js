const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Portfolio, PortfolioAsset, Watchlist } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const AssetService = require('../services/assetService');

const assetService = new AssetService();

const router = express.Router();

// Get all portfolios for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: PortfolioAsset,
        as: 'assets'
      }],
      order: [['created_at', 'DESC']]
    });

    // Calculate portfolio values
    const portfoliosWithValues = await Promise.all(
      portfolios.map(async (portfolio) => {
        const portfolioData = portfolio.toJSON();
        
        if (portfolioData.assets && portfolioData.assets.length > 0) {
          const symbols = portfolioData.assets.map(asset => asset.symbol);
          const currentPrices = await assetService.getMultipleAssetsInfo(symbols);
          
          let totalValue = 0;
          let totalCost = 0;
          
          portfolioData.assets = portfolioData.assets.map(asset => {
            const currentPrice = currentPrices.find(p => p.symbol === asset.symbol)?.price || 0;
            const totalAssetValue = currentPrice * asset.quantity;
            const totalAssetCost = asset.average_price * asset.quantity;
            const profitLoss = totalAssetValue - totalAssetCost;
            const profitLossPercent = totalAssetCost > 0 ? (profitLoss / totalAssetCost) * 100 : 0;
            
            totalValue += totalAssetValue;
            totalCost += totalAssetCost;
            
            return {
              ...asset,
              current_price: currentPrice,
              total_value: totalAssetValue,
              profit_loss: profitLoss,
              profit_loss_percent: profitLossPercent
            };
          });
          
          portfolioData.total_value = totalValue;
          portfolioData.total_profit_loss = totalValue - totalCost;
          portfolioData.total_profit_loss_percent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
        } else {
          portfolioData.total_value = 0;
          portfolioData.total_profit_loss = 0;
          portfolioData.total_profit_loss_percent = 0;
        }
        
        return portfolioData;
      })
    );

    res.json({
      success: true,
      data: portfoliosWithValues
    });
  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Create new portfolio
router.post('/', authenticateToken, [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    const portfolio = await Portfolio.create({
      name,
      description,
      user_id: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio criado com sucesso',
      data: portfolio
    });
  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get specific portfolio
router.get('/:id', authenticateToken, [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id },
      include: [{
        model: PortfolioAsset,
        as: 'assets'
      }]
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    const portfolioData = portfolio.toJSON();
    
    // Calculate current values
    if (portfolioData.assets && portfolioData.assets.length > 0) {
      const symbols = portfolioData.assets.map(asset => asset.symbol);
      const currentPrices = await assetService.getMultipleAssetsInfo(symbols);
      
      let totalValue = 0;
      let totalCost = 0;
      
      portfolioData.assets = portfolioData.assets.map(asset => {
        const currentPrice = currentPrices.find(p => p.symbol === asset.symbol)?.price || 0;
        const totalAssetValue = currentPrice * asset.quantity;
        const totalAssetCost = asset.average_price * asset.quantity;
        const profitLoss = totalAssetValue - totalAssetCost;
        const profitLossPercent = totalAssetCost > 0 ? (profitLoss / totalAssetCost) * 100 : 0;
        
        totalValue += totalAssetValue;
        totalCost += totalAssetCost;
        
        return {
          ...asset,
          current_price: currentPrice,
          total_value: totalAssetValue,
          profit_loss: profitLoss,
          profit_loss_percent: profitLossPercent
        };
      });
      
      portfolioData.total_value = totalValue;
      portfolioData.total_profit_loss = totalValue - totalCost;
      portfolioData.total_profit_loss_percent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    } else {
      portfolioData.total_value = 0;
      portfolioData.total_profit_loss = 0;
      portfolioData.total_profit_loss_percent = 0;
    }

    res.json({
      success: true,
      data: portfolioData
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Update portfolio
router.put('/:id', authenticateToken, [
  param('id').isInt({ min: 1 }),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    await portfolio.update(updateData);
    await portfolio.reload();

    res.json({
      success: true,
      message: 'Portfolio atualizado com sucesso',
      data: portfolio
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Delete portfolio
router.delete('/:id', authenticateToken, [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    // Delete all assets in portfolio first
    await PortfolioAsset.destroy({
      where: { portfolio_id: id }
    });

    // Delete portfolio
    await portfolio.destroy();

    res.json({
      success: true,
      message: 'Portfolio excluído com sucesso'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get portfolio assets
router.get('/:id/assets', authenticateToken, [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id },
      include: [{
        model: PortfolioAsset,
        as: 'assets'
      }]
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    const assets = portfolio.assets || [];
    
    // Get current prices for all assets
    if (assets.length > 0) {
      const symbols = assets.map(asset => asset.symbol);
      const currentPrices = await assetService.getMultipleAssetsInfo(symbols);
      
      const assetsWithPrices = assets.map(asset => {
        const currentPrice = currentPrices.find(p => p.symbol === asset.symbol)?.price || 0;
        const quantity = parseFloat(asset.quantity);
        const averagePrice = parseFloat(asset.average_price);
        const totalValue = currentPrice * quantity;
        const totalCost = averagePrice * quantity;
        const profitLoss = totalValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
        
        const assetData = asset.toJSON();
        const formattedAsset = {
          id: assetData.id,
          portfolioId: assetData.portfolio_id,
          symbol: assetData.symbol,
          quantity: parseFloat(quantity.toFixed(4)), // Limit to 4 decimal places
          averagePrice: parseFloat(averagePrice.toFixed(2)), // Limit to 2 decimal places
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          totalValue: parseFloat(totalValue.toFixed(2)),
          gain: parseFloat(profitLoss.toFixed(2)),
          gainPercent: parseFloat(profitLossPercent.toFixed(2)),
          addedAt: assetData.created_at,
          updatedAt: assetData.updated_at
        };
        
        console.log(`Asset ${asset.symbol} formatted:`, formattedAsset);
        return formattedAsset;
      });
      
      res.json({
        success: true,
        data: assetsWithPrices
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get portfolio assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get portfolio performance
router.get('/:id/performance', authenticateToken, [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id },
      include: [{
        model: PortfolioAsset,
        as: 'assets'
      }]
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    const assets = portfolio.assets || [];
    
    if (assets.length === 0) {
      return res.json({
        success: true,
        data: {
          total_value: 0,
          total_cost: 0,
          total_profit_loss: 0,
          total_profit_loss_percent: 0,
          daily_change: 0,
          daily_change_percent: 0,
          performance_history: []
        }
      });
    }

    // Get current prices for all assets
    const symbols = assets.map(asset => asset.symbol);
    const currentPrices = await assetService.getMultipleAssetsInfo(symbols);
    
    let totalValue = 0;
    let totalCost = 0;
    
    assets.forEach(asset => {
      const currentPrice = currentPrices.find(p => p.symbol === asset.symbol)?.price || 0;
      totalValue += currentPrice * asset.quantity;
      totalCost += asset.average_price * asset.quantity;
    });
    
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
    
    // For now, return basic performance data
    // In a real implementation, you would calculate historical performance
    res.json({
      success: true,
      data: {
        total_value: totalValue,
        total_cost: totalCost,
        total_profit_loss: totalProfitLoss,
        total_profit_loss_percent: totalProfitLossPercent,
        daily_change: 0, // Would need historical data
        daily_change_percent: 0, // Would need historical data
        performance_history: [] // Would need historical data
      }
    });
  } catch (error) {
    console.error('Get portfolio performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Add asset to portfolio
router.post('/:id/assets', authenticateToken, [
  param('id').isInt({ min: 1 }),
  body('symbol').notEmpty().trim().toUpperCase(),
  body('quantity').isFloat({ min: 0.00000001 }),
  body('average_price').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { symbol, quantity, average_price } = req.body;

    // Check if portfolio exists and belongs to user
    const portfolio = await Portfolio.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    // Verify asset exists
    try {
      await assetService.getAssetInfo(symbol);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Ativo não encontrado'
      });
    }

    // Check if asset already exists in portfolio
    const existingAsset = await PortfolioAsset.findOne({
      where: { portfolio_id: id, symbol }
    });

    if (existingAsset) {
      // Update existing asset (average price calculation)
      const totalQuantity = parseFloat(existingAsset.quantity) + parseFloat(quantity);
      const totalValue = (parseFloat(existingAsset.quantity) * parseFloat(existingAsset.average_price)) + 
                        (parseFloat(quantity) * parseFloat(average_price));
      const newAveragePrice = totalValue / totalQuantity;

      await existingAsset.update({
        quantity: totalQuantity,
        average_price: newAveragePrice
      });

      await existingAsset.reload();

      res.json({
        success: true,
        message: 'Ativo atualizado no portfolio',
        data: existingAsset
      });
    } else {
      // Create new asset
      const portfolioAsset = await PortfolioAsset.create({
        portfolio_id: id,
        symbol,
        quantity: parseFloat(quantity),
        average_price: parseFloat(average_price)
      });

      res.status(201).json({
        success: true,
        message: 'Ativo adicionado ao portfolio',
        data: portfolioAsset
      });
    }
  } catch (error) {
    console.error('Add asset to portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Update asset in portfolio
router.put('/:portfolioId/assets/:assetId', authenticateToken, [
  param('portfolioId').isInt({ min: 1 }),
  param('assetId').isInt({ min: 1 }),
  body('quantity').optional().isFloat({ min: 0.00000001 }),
  body('average_price').optional().isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { portfolioId, assetId } = req.params;
    const { quantity, average_price } = req.body;

    // Check if portfolio belongs to user
    const portfolio = await Portfolio.findOne({
      where: { id: portfolioId, user_id: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    // Find asset
    const asset = await PortfolioAsset.findOne({
      where: { id: assetId, portfolio_id: portfolioId }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Ativo não encontrado no portfolio'
      });
    }

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (average_price !== undefined) updateData.average_price = parseFloat(average_price);

    await asset.update(updateData);
    await asset.reload();

    res.json({
      success: true,
      message: 'Ativo atualizado com sucesso',
      data: asset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Remove asset from portfolio
router.delete('/:portfolioId/assets/:assetId', authenticateToken, [
  param('portfolioId').isInt({ min: 1 }),
  param('assetId').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { portfolioId, assetId } = req.params;

    // Check if portfolio belongs to user
    const portfolio = await Portfolio.findOne({
      where: { id: portfolioId, user_id: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio não encontrado'
      });
    }

    // Find and delete asset
    const asset = await PortfolioAsset.findOne({
      where: { id: assetId, portfolio_id: portfolioId }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Ativo não encontrado no portfolio'
      });
    }

    await asset.destroy();

    res.json({
      success: true,
      message: 'Ativo removido do portfolio'
    });
  } catch (error) {
    console.error('Remove asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get user's watchlist
router.get('/watchlist/all', authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    // Get current prices for watchlist items
    if (watchlist.length > 0) {
      const symbols = watchlist.map(item => item.symbol);
      const currentPrices = await assetService.getMultipleAssetsInfo(symbols);
      
      const watchlistWithPrices = watchlist.map(item => {
        const priceData = currentPrices.find(p => p.symbol === item.symbol);
        return {
          ...item.toJSON(),
          current_price: priceData?.price || 0,
          change: priceData?.change || 0,
          change_percent: priceData?.change_percent || 0
        };
      });

      res.json({
        success: true,
        data: watchlistWithPrices
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Add to watchlist
router.post('/watchlist', authenticateToken, [
  body('symbol').notEmpty().trim().toUpperCase(),
  body('name').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { symbol, name } = req.body;

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      where: { user_id: req.user.id, symbol }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ativo já está na watchlist'
      });
    }

    // Verify asset exists
    let assetName = name;
    try {
      const assetInfo = await assetService.getAssetInfo(symbol);
      if (!assetName) {
        assetName = assetInfo.name;
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Ativo não encontrado'
      });
    }

    const watchlistItem = await Watchlist.create({
      user_id: req.user.id,
      symbol,
      name: assetName
    });

    res.status(201).json({
      success: true,
      message: 'Ativo adicionado à watchlist',
      data: watchlistItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Remove from watchlist
router.delete('/watchlist/:id', authenticateToken, [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const watchlistItem = await Watchlist.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado na watchlist'
      });
    }

    await watchlistItem.destroy();

    res.json({
      success: true,
      message: 'Ativo removido da watchlist'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;