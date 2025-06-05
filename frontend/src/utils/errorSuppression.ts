/**
 * Utility for suppressing TradingView and external widget console errors
 * This helps clean up the console by filtering out known harmless errors from third-party widgets
 */

interface ErrorSuppressionConfig {
  duration?: number; // Duration in milliseconds to suppress errors
  patterns?: string[]; // Additional error patterns to suppress
}

const DEFAULT_SUPPRESSED_PATTERNS = [
  'Invalid environment undefined',
  'Invalid environment',
  'contentWindow is not available',
  'embed-widget-events',
  'snowplow-embed-widget',
  'Failed to fetch',
  'WebSocket connection',
  'cannot_get_metainfo',
  'ReutersCalendar',
  'Chart.Model.StudyPropertiesOverrider',
  'Chart.Studies.StudyInserter',
  'Property:The state with a data type',
  'uBOL: Generic cosmetic filtering',
  'pushstream.tradingview.com',
  'chartevents-reuters.tradingview.com',
  'Uncaught (in promise) cannot_get_metainfo',
  'WebSocket is closed before the connection is established',
  'snowplow-embed-widget-tracker',
  'TypeError: Failed to fetch',
  'Fetch: `https://chartevents-reuters.tradingview.com',
  'ReutersCalendar:An error ocurred while loading economic events',
  'wss://pushstream.tradingview.com/message-pipe-ws/public',
  'runtime-embed_events_widget',
  'embed_events_widget',
  '3567.bd4661391dbe1d6350e9.js',
  '53187.1ece137bed5f979e42ca.js',
  '95942.8677cea99a1e7e04796d.js',
  '82321.48569a458a5ea320e7da.js',
  '36511.f72678eff367332593c3.js'
];

class ErrorSuppressor {
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private isActive: boolean = false;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  /**
   * Start suppressing console errors and warnings
   */
  start(config: ErrorSuppressionConfig = {}) {
    if (this.isActive) {
      return; // Already active
    }

    const { duration = 10000, patterns = [] } = config;
    const suppressedPatterns = [...DEFAULT_SUPPRESSED_PATTERNS, ...patterns];

    this.isActive = true;

    console.error = (...args) => {
      const message = args.join(' ');
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.includes(pattern)
      );
      
      if (!shouldSuppress) {
        this.originalConsoleError.apply(console, args);
      }
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.includes(pattern)
      );
      
      if (!shouldSuppress) {
        this.originalConsoleWarn.apply(console, args);
      }
    };

    // Auto-restore after duration
    if (duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.stop();
      }, duration);
    }
  }

  /**
   * Stop suppressing console errors and warnings
   */
  stop() {
    if (!this.isActive) {
      return; // Already inactive
    }

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.isActive = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Check if error suppression is currently active
   */
  isActiveSuppression(): boolean {
    return this.isActive;
  }
}

// Global instance
const errorSuppressor = new ErrorSuppressor();

/**
 * Convenience function to temporarily suppress TradingView errors
 * @param duration Duration in milliseconds (default: 10 seconds)
 * @param additionalPatterns Additional error patterns to suppress
 */
export const suppressTradingViewErrors = (
  duration: number = 10000, 
  additionalPatterns: string[] = []
) => {
  errorSuppressor.start({ duration, patterns: additionalPatterns });
  return () => errorSuppressor.stop(); // Return cleanup function
};

/**
 * Start global error suppression (manual control)
 */
export const startErrorSuppression = (config?: ErrorSuppressionConfig) => {
  errorSuppressor.start(config);
};

/**
 * Stop global error suppression
 */
export const stopErrorSuppression = () => {
  errorSuppressor.stop();
};

/**
 * Check if error suppression is active
 */
export const isErrorSuppressionActive = () => {
  return errorSuppressor.isActiveSuppression();
};

export default errorSuppressor;