// Import all API services using default imports
import categoriesApi from './categoriesApi';
import partiesApi from './partiesApi';
import walletsApi from './walletsApi';
import groupsApi from './groupsApi';
import configurationsApi from './configurationsApi';
import transactionApi from '../transactionApi';

// Re-export individual services
export { categoriesApi, partiesApi, walletsApi, groupsApi, configurationsApi, transactionApi };

/**
 * Centralized API service object
 * Provides a single entry point for all API operations
 */
export const api = {
  categories: categoriesApi,
  parties: partiesApi,
  wallets: walletsApi,
  groups: groupsApi,
  configurations: configurationsApi,
  transactions: transactionApi
} as const;
