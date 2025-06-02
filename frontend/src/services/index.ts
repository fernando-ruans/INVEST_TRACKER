// Re-export all services from api.ts
export {
  assetService,
  portfolioService,
  newsService,
  calendarService
} from './api';

// Export the default axios instance
export { default as api } from './api';