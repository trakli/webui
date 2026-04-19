/**
 * Configuration Keys
 * Centralized definition of all configuration key names used throughout the app
 * Prevents typos and ensures consistency across all features
 */

export const CONFIGURATION_KEYS = {
  LANGUAGE: 'default-lang',
  CURRENCY: 'default-currency',
  WALLET: 'default-wallet',
  GROUP: 'default-group',
  THEME: 'theme',
  ONBOARDING_COMPLETE: 'onboarding-complete',
  BUDGET_DEFAULT_THRESHOLD: 'budget-default-threshold-percent',
  BUDGET_DEFAULT_ROLLOVER: 'budget-default-rollover-enabled',
  BUDGET_DEFAULT_PERIOD: 'budget-default-period-type',
  BUDGET_FORECAST_DEFAULT: 'budget-forecast-alerts-default',
  BUDGET_LIST_SORT: 'budget-list-sort',
  BUDGET_DIGEST_ENABLED: 'budget-weekly-digest-enabled'
} as const;
