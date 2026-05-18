# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-05-18

### Changed

- Visual language refreshed with tonal surfaces and split layouts across the app
- Transactions table polished with a totals footer row
- Settings card tightened with a visible border around the panel
- Categories now use a tag icon in the sidebar

### Fixed

- AI chat no longer hangs in an indefinite pending state when poll responses arrive out of order
- Imports walkthrough now shows its document illustration on every slide
- Settings toggle for allowing negative balances saves reliably and surfaces toast feedback

## [1.1.1] - 2026-05-03

### Added

- Image thumbnails for picked transaction attachments, with saved attachments rendered as cards on the edit form and a per-file remove control that deletes them server-side
- Transactions list now refetches on tab focus so records synced from other clients (mobile, web) show up without forcing a re-login

### Fixed

- Transaction attachments are uploaded as multipart binary files instead of base64 JSON, so the backend file validator accepts them again
- Files picked during a transaction edit are now actually uploaded (the update flow used to silently drop them)
- The attachment picker appends to the existing selection instead of replacing it, and silently caps the total at five attachments to match the visible hint
- Imports confirm step resolves targets by id and updates names reactively

## [1.1.0] - 2026-04-19

### Added

- Budgets: dedicated pages for listing and detail, form with target picker across categories / groups / wallets, period presets plus custom range, rollover toggle, threshold slider, and forecast alerts; BudgetCard with progress bar and status chip
- Refund marking on income transactions: picker that searches all expenses, a visible "Refund" tag on list and spreadsheet views, and automatic budget adjustment when the refund posts
- Recurring transactions UI with period and interval controls
- Reminders page with pause / resume / snooze and translations for every supported locale
- Dashboard spreadsheet mode: pinned header and totals, client-side search, density-tuned grid sized for many rows
- Imports page: document upload and suggestion review with per-entity auto-create controls
- Transaction list server-side pagination and filter bar with date, wallet, and category filters
- AI chat UI rebuilt around sessions, with polling and a unified top-bar theme selector
- Onboarding "empty state" variant for budgets plus loading state on the final action button
- Persistent sidebar subtext (collapsible shell with nested sub-items for Budgets) and its translations
- `radix-vue` primitives for accessible dropdowns and menus

### Changed

- Collapsible sidebar replaces the old always-expanded rail; state persists across reloads
- Dashboard layout scrolls inside the rounded card so corners stay visible
- Content tables share density tokens and sticky totals; transactions view picked up a spreadsheet trigger
- All list endpoints now loop through pages so users with large parties / wallets / categories no longer miss rows
- AI chat panel split into focused sub-components; dropdown open/close extracted into a composable

### Fixed

- Dropdown toggle no longer requires a double-click; chevron clears selection to allow re-selection
- Onboarding typo (`completOnboarding` → `completeOnboarding`); duplicate handling and submit locks on forms
- Dark-mode regression on the dashboard; stats now exclude transfer transactions from aggregation
- Dashboard stats display amounts in the user's configured default currency
- Currency options on the budget form read wallet currencies without a hardcoded length check
- Refund picker no longer hangs a while loop on unexpected pagination data

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
