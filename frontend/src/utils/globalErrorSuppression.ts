/**
 * Global error suppression setup for the application
 * This handles TradingView and other third-party widget errors at the application level
 */

import { startErrorSuppression, stopErrorSuppression } from './errorSuppression';

// Flag to track if global suppression is active
let isGlobalSuppressionActive = false;

/**
 * Initialize global error suppression for TradingView widgets
 * This should be called once when the application starts
 */
export const initializeGlobalErrorSuppression = () => {
  if (isGlobalSuppressionActive) {
    return; // Already initialized
  }

  // Start global error suppression without auto-timeout
  startErrorSuppression({ duration: 0 }); // 0 means no auto-timeout
  isGlobalSuppressionActive = true;

  // Optional: Add a listener for page visibility changes to re-enable suppression
  // This helps handle cases where widgets are loaded dynamically
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !isGlobalSuppressionActive) {
        startErrorSuppression({ duration: 0 });
        isGlobalSuppressionActive = true;
      }
    });
  }

  console.log('🔇 Global TradingView error suppression initialized');
};

/**
 * Cleanup global error suppression
 * This should be called when the application is being destroyed
 */
export const cleanupGlobalErrorSuppression = () => {
  if (!isGlobalSuppressionActive) {
    return; // Already cleaned up
  }

  stopErrorSuppression();
  isGlobalSuppressionActive = false;
  console.log('🔊 Global TradingView error suppression cleaned up');
};

/**
 * Check if global error suppression is active
 */
export const isGlobalSuppressionEnabled = () => {
  return isGlobalSuppressionActive;
};

/**
 * Temporarily disable global suppression (useful for debugging)
 */
export const temporarilyDisableGlobalSuppression = (durationMs: number = 30000) => {
  if (!isGlobalSuppressionActive) {
    return;
  }

  stopErrorSuppression();
  isGlobalSuppressionActive = false;
  
  console.log(`🔊 Global error suppression temporarily disabled for ${durationMs}ms`);
  
  setTimeout(() => {
    if (!isGlobalSuppressionActive) {
      startErrorSuppression({ duration: 0 });
      isGlobalSuppressionActive = true;
      console.log('🔇 Global error suppression re-enabled');
    }
  }, durationMs);
};

export default {
  initialize: initializeGlobalErrorSuppression,
  cleanup: cleanupGlobalErrorSuppression,
  isEnabled: isGlobalSuppressionEnabled,
  temporarilyDisable: temporarilyDisableGlobalSuppression
};