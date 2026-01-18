# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-01-18

### Added

- Transfer transactions between wallets with exchange rate support
- Default indicator badge for groups in transaction form

### Fixed

- Dashboard stats now display amounts in user's configured default currency
- Configuration API falls back to create when updating non-existent config
- SearchableDropdown toggle now works correctly without requiring double-click
- Clicking dropdown chevron clears selection to allow re-selection

## [1.0.1] - 2025-01-13

### Fixed

- Form updates failing with updated_at ISO 8601 validation error
- Wallet currency not syncing with user selection during onboarding
- Category selection not persisting when creating or editing transactions

## [1.0.0] - 2025-01-13

### Added

- Dashboard with transaction overview and statistics
- Transaction management (create, edit, delete)
- Category management with icons
- Wallet management
- Party (payee/payer) management
- User authentication (email/password and OAuth)
- Onboarding flow for new users
- Dark mode support
- Internationalization (English, French, Spanish, German)
- Responsive design for mobile and desktop
