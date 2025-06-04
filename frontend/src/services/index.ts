// Re-export all services from api.ts
export {
  assetService,
  portfolioService,
  newsService,
  calendarService
} from './api';

// Export the auth service
export { authService } from './auth';

// Export the axios instance
export { api } from './api';