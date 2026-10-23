import type { LocationQuery } from 'vue-router';

export const DEFAULT_SETTINGS_TAB = 'account';

export function selectedSettingsTab(query: LocationQuery, available: string[]): string {
  const requested = typeof query.tab === 'string' ? query.tab : '';
  return available.includes(requested) ? requested : DEFAULT_SETTINGS_TAB;
}
