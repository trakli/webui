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
  ONBOARDING_COMPLETE: 'onboarding-complete'
} as const;
