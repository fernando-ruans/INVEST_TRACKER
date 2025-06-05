class CalendarService {
  constructor() {
    // Economic event categories and their typical impact
    this.eventCategories = {
      'GDP': 'High',
      'Inflation': 'High',
      'Employment': 'High',
      'Interest Rate': 'High',
      'Trade Balance': 'Medium',
      'Consumer Confidence': 'Medium',
      'Manufacturing': 'Medium',
      'Retail Sales': 'Medium',
      'Housing': 'Low',
      'Business Confidence': 'Low'
    };

    this.countries = {
      'US': 'United States',
      'EU': 'European Union',
      'JP': 'Japan',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'CH': 'Switzerland',
      'CN': 'China'
    };
  }

  // Get economic events
  async getEconomicEvents(options = {}) {
    try {
      const {
        startDate,
        endDate,
        country,
        importance,
        limit = 50
      } = options;

      // For demo purposes, generate mock economic events
      const events = this.generateMockEvents({
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        country,
        importance,
        limit
      });

      return events;
    } catch (error) {
      console.error('Error fetching economic events:', error.message);
      throw new Error(`Failed to fetch economic events: ${error.message}`);
    }
  }

  // Get today's events
  async getTodaysEvents(options = {}) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEconomicEvents({
      ...options,
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
      limit: 20
    });
  }

  // Get this week's events
  async getWeekEvents(options = {}) {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return this.getEconomicEvents({
      ...options,
      startDate: today.toISOString(),
      endDate: weekFromNow.toISOString(),
      limit: 50
    });
  }

  // Get high impact events
  async getHighImpactEvents(options = {}) {
    const { daysAhead = 7, country } = options;
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.getEconomicEvents({
      startDate: today.toISOString(),
      endDate: futureDate.toISOString(),
      country,
      importance: 'High',
      limit: 30
    });
  }

  // Get events by country
  async getEventsByCountry(countryCode, options = {}) {
    return this.getEconomicEvents({
      ...options,
      country: countryCode
    });
  }

  // Get market holidays
  async getMarketHolidays(options = {}) {
    const { year = new Date().getFullYear(), country } = options;
    
    const holidays = this.generateMarketHolidays(year, country);
    return holidays;
  }

  // Generate mock economic events
  generateMockEvents(options) {
    const {
      startDate,
      endDate,
      country,
      importance,
      limit
    } = options;

    const events = [];
    const eventTypes = [
      { name: 'GDP Growth Rate', category: 'GDP', typical_time: '08:30' },
      { name: 'Consumer Price Index', category: 'Inflation', typical_time: '08:30' },
      { name: 'Unemployment Rate', category: 'Employment', typical_time: '08:30' },
      { name: 'Federal Funds Rate', category: 'Interest Rate', typical_time: '14:00' },
      { name: 'Trade Balance', category: 'Trade Balance', typical_time: '08:30' },
      { name: 'Consumer Confidence Index', category: 'Consumer Confidence', typical_time: '10:00' },
      { name: 'Manufacturing PMI', category: 'Manufacturing', typical_time: '09:45' },
      { name: 'Retail Sales', category: 'Retail Sales', typical_time: '08:30' },
      { name: 'Housing Starts', category: 'Housing', typical_time: '08:30' },
      { name: 'Business Confidence', category: 'Business Confidence', typical_time: '10:00' }
    ];

    const countries = country ? [country] : Object.keys(this.countries);
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate && events.length < limit) {
      // Skip weekends for most events
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Generate 1-3 events per day
        const eventsPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < eventsPerDay && events.length < limit; i++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const eventCountry = countries[Math.floor(Math.random() * countries.length)];
          const eventImportance = this.eventCategories[eventType.category];
          
          // Filter by importance if specified
          if (importance && eventImportance !== importance) {
            continue;
          }

          const event = {
            date: new Date(currentDate).toISOString(),
            time: eventType.typical_time,
            event: `${this.countries[eventCountry]} ${eventType.name}`,
            country: eventCountry,
            importance: eventImportance,
            actual: this.generateRandomValue(eventType.category),
            forecast: this.generateRandomValue(eventType.category),
            previous: this.generateRandomValue(eventType.category),
            currency: this.getCurrencyByCountry(eventCountry),
            category: eventType.category
          };

          events.push(event);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort events by date and time
    events.sort((a, b) => {
      const dateA = new Date(`${a.date.split('T')[0]}T${a.time}:00`);
      const dateB = new Date(`${b.date.split('T')[0]}T${b.time}:00`);
      return dateA - dateB;
    });

    return events;
  }

  // Generate market holidays
  generateMarketHolidays(year, country) {
    const holidays = {
      'US': [
        { name: 'New Year\'s Day', date: `${year}-01-01` },
        { name: 'Martin Luther King Jr. Day', date: this.getNthWeekdayOfMonth(year, 0, 1, 3) },
        { name: 'Presidents\' Day', date: this.getNthWeekdayOfMonth(year, 1, 1, 3) },
        { name: 'Good Friday', date: this.getGoodFriday(year) },
        { name: 'Memorial Day', date: this.getLastWeekdayOfMonth(year, 4, 1) },
        { name: 'Independence Day', date: `${year}-07-04` },
        { name: 'Labor Day', date: this.getNthWeekdayOfMonth(year, 8, 1, 1) },
        { name: 'Thanksgiving', date: this.getNthWeekdayOfMonth(year, 10, 4, 4) },
        { name: 'Christmas Day', date: `${year}-12-25` }
      ],
      'EU': [
        { name: 'New Year\'s Day', date: `${year}-01-01` },
        { name: 'Good Friday', date: this.getGoodFriday(year) },
        { name: 'Easter Monday', date: this.getEasterMonday(year) },
        { name: 'Labour Day', date: `${year}-05-01` },
        { name: 'Christmas Day', date: `${year}-12-25` },
        { name: 'Boxing Day', date: `${year}-12-26` }
      ]
    };

    if (country && holidays[country]) {
      return holidays[country];
    }

    // Return all holidays if no specific country
    const allHolidays = [];
    Object.keys(holidays).forEach(countryCode => {
      holidays[countryCode].forEach(holiday => {
        allHolidays.push({
          ...holiday,
          country: countryCode
        });
      });
    });

    return allHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Helper methods
  generateRandomValue(category) {
    const ranges = {
      'GDP': { min: -2.0, max: 5.0, suffix: '%' },
      'Inflation': { min: 0.0, max: 8.0, suffix: '%' },
      'Employment': { min: 3.0, max: 12.0, suffix: '%' },
      'Interest Rate': { min: 0.0, max: 6.0, suffix: '%' },
      'Trade Balance': { min: -50.0, max: 20.0, suffix: 'B' },
      'Consumer Confidence': { min: 80, max: 140, suffix: '' },
      'Manufacturing': { min: 40, max: 65, suffix: '' },
      'Retail Sales': { min: -5.0, max: 8.0, suffix: '%' },
      'Housing': { min: 800, max: 1800, suffix: 'K' },
      'Business Confidence': { min: -50, max: 50, suffix: '' }
    };

    const range = ranges[category] || { min: 0, max: 100, suffix: '' };
    const value = (Math.random() * (range.max - range.min) + range.min);
    
    if (range.suffix === '%' || range.suffix === 'B') {
      return `${value.toFixed(1)}${range.suffix}`;
    } else if (range.suffix === 'K') {
      return `${Math.round(value)}${range.suffix}`;
    } else {
      return `${Math.round(value)}`;
    }
  }

  getCurrencyByCountry(country) {
    const currencies = {
      'US': 'USD',
      'EU': 'EUR',
      'JP': 'JPY',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD',
      'CH': 'CHF',
      'CN': 'CNY'
    };
    return currencies[country] || 'USD';
  }

  // Date calculation helpers
  getNthWeekdayOfMonth(year, month, weekday, n) {
    const date = new Date(year, month, 1);
    const firstWeekday = date.getDay();
    const daysToAdd = (weekday - firstWeekday + 7) % 7 + (n - 1) * 7;
    date.setDate(1 + daysToAdd);
    return date.toISOString().split('T')[0];
  }

  getLastWeekdayOfMonth(year, month, weekday) {
    const date = new Date(year, month + 1, 0); // Last day of month
    const lastWeekday = date.getDay();
    const daysToSubtract = (lastWeekday - weekday + 7) % 7;
    date.setDate(date.getDate() - daysToSubtract);
    return date.toISOString().split('T')[0];
  }

  getGoodFriday(year) {
    // Easter calculation (simplified)
    const easter = this.getEasterDate(year);
    easter.setDate(easter.getDate() - 2);
    return easter.toISOString().split('T')[0];
  }

  getEasterMonday(year) {
    const easter = this.getEasterDate(year);
    easter.setDate(easter.getDate() + 1);
    return easter.toISOString().split('T')[0];
  }

  getEasterDate(year) {
    // Simplified Easter calculation
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }
}

module.exports = new CalendarService();