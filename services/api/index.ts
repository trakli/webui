// Import all API services using default imports
import categoriesApi from './categoriesApi';
import partiesApi from './partiesApi';
import walletsApi from './walletsApi';
import groupsApi from './groupsApi';
import configurationsApi from './configurationsApi';
import statsApi from './statsApi';
import remindersApi from './remindersApi';
import notificationsApi from './notificationsApi';
import importsApi from './importsApi';
import budgetsApi from './budgetsApi';
import transactionApi from '../transactionApi';

// Re-export individual services
export {
  categoriesApi,
  partiesApi,
  walletsApi,
  groupsApi,
  configurationsApi,
  statsApi,
  remindersApi,
  notificationsApi,
  importsApi,
  budgetsApi,
  transactionApi
};

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
  stats: statsApi,
  reminders: remindersApi,
  notifications: notificationsApi,
  imports: importsApi,
  budgets: budgetsApi,
  transactions: transactionApi
} as const;
