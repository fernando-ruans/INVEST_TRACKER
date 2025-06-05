# Error Suppression Utilities

This directory contains utilities for managing console error suppression, specifically designed to handle TradingView widget errors that are harmless but clutter the console.

## Files

### `errorSuppression.ts`
Core utility for suppressing specific console error patterns.

**Features:**
- Configurable error pattern matching
- Automatic restoration after timeout
- Manual start/stop control
- Thread-safe singleton pattern

**Usage:**
```typescript
import { suppressTradingViewErrors } from '../utils/errorSuppression';

// Suppress errors for 10 seconds
const cleanup = suppressTradingViewErrors(10000);

// Manual cleanup
cleanup();
```

### `globalErrorSuppression.ts`
Application-level error suppression management.

**Features:**
- Global initialization on app start
- Persistent suppression (no auto-timeout)
- Visibility change handling
- Debug mode support

**Usage:**
```typescript
import { initializeGlobalErrorSuppression } from '../utils/globalErrorSuppression';

// Initialize once in App.tsx
initializeGlobalErrorSuppression();
```

## Suppressed Error Patterns

The following error patterns are automatically suppressed:

- `Invalid environment undefined` - TradingView environment issues
- `contentWindow is not available` - iframe access errors
- `embed-widget-events` - Widget embedding errors
- `snowplow-embed-widget` - Analytics tracking errors
- `Failed to fetch` - Network request failures
- `WebSocket connection` - WebSocket connection issues
- `cannot_get_metainfo` - TradingView metadata errors
- `ReutersCalendar` - Reuters calendar widget errors
- `Chart.Model.StudyPropertiesOverrider` - Chart study errors
- `Chart.Studies.StudyInserter` - Chart study insertion errors
- `Property:The state with a data type` - TradingView state errors
- `uBOL: Generic cosmetic filtering` - Browser extension interference
- `pushstream.tradingview.com` - TradingView streaming errors
- `chartevents-reuters.tradingview.com` - Reuters chart events errors
- `WebSocket is closed before the connection is established` - WebSocket timing issues

## Implementation

### Component Level
For components that use TradingView widgets:

```typescript
import { suppressTradingViewErrors } from '../utils/errorSuppression';

useEffect(() => {
  // Start suppression before widget initialization
  const cleanup = suppressTradingViewErrors(15000);
  
  // Initialize TradingView widget
  initializeWidget();
  
  return cleanup; // Cleanup on unmount
}, []);
```

### Global Level
Initialized once in `App.tsx`:

```typescript
import { initializeGlobalErrorSuppression } from './utils/globalErrorSuppression';

// At app startup
initializeGlobalErrorSuppression();
```

## Debugging

To temporarily disable error suppression for debugging:

```typescript
import { temporarilyDisableGlobalSuppression } from '../utils/globalErrorSuppression';

// Disable for 30 seconds
temporarilyDisableGlobalSuppression(30000);
```

## Benefits

1. **Cleaner Console**: Removes harmless but noisy TradingView errors
2. **Better Development Experience**: Focus on actual application errors
3. **Centralized Management**: Single place to manage error patterns
4. **Flexible Control**: Component-level and global-level suppression
5. **Debug-Friendly**: Easy to disable for troubleshooting

## Notes

- Error suppression only affects console output, not actual functionality
- Real errors (non-TradingView) are still displayed
- Suppression is automatically restored after timeouts
- Safe to use in production environments