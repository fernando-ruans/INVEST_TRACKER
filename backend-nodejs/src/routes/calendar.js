const express = require('express');
const { query, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const calendarService = require('../services/calendarService');

const router = express.Router();

// Get economic events
router.get('/events', [
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('country').optional().isIn(['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN']),
  query('importance').optional().isIn(['Low', 'Medium', 'High']),
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

    const {
      start_date,
      end_date,
      country,
      importance,
      limit = 50
    } = req.query;

    const events = await calendarService.getEconomicEvents({
      startDate: start_date,
      endDate: end_date,
      country,
      importance,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get economic events error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get today's events
router.get('/today', [
  query('importance').optional().isIn(['Low', 'Medium', 'High']),
  query('country').optional().isIn(['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN'])
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

    const { importance, country } = req.query;
    
    const events = await calendarService.getTodaysEvents({ importance, country });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get today events error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get this week's events
router.get('/week', [
  query('importance').optional().isIn(['Low', 'Medium', 'High']),
  query('country').optional().isIn(['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN'])
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

    const { importance, country } = req.query;
    
    const events = await calendarService.getWeekEvents({ importance, country });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get week events error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get high importance events
router.get('/high-impact', [
  query('days_ahead').optional().isInt({ min: 1, max: 30 }),
  query('country').optional().isIn(['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN'])
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

    const { days_ahead = 7, country } = req.query;
    
    const events = await calendarService.getHighImpactEvents({
      daysAhead: parseInt(days_ahead),
      country
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get high impact events error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get events by country
router.get('/country/:country', [
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('importance').optional().isIn(['Low', 'Medium', 'High'])
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

    const { country } = req.params;
    const { start_date, end_date, importance } = req.query;
    
    if (!['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN'].includes(country)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid country code'
      });
    }

    const events = await calendarService.getEventsByCountry(country, {
      startDate: start_date,
      endDate: end_date,
      importance
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events by country error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get market holidays
router.get('/holidays', [
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('country').optional().isIn(['US', 'EU', 'JP', 'GB', 'CA', 'AU', 'CH', 'CN'])
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

    const { year = new Date().getFullYear(), country } = req.query;
    
    const holidays = await calendarService.getMarketHolidays({
      year: parseInt(year),
      country
    });
    
    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    console.error('Get market holidays error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;