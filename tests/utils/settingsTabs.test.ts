import { describe, expect, it } from 'vitest';
import { selectedSettingsTab } from '~/utils/settingsTabs';

const available = ['account', 'general', 'banks'];

describe('selectedSettingsTab', () => {
  it('opens the tab named in the address', () => {
    expect(selectedSettingsTab({ tab: 'banks' }, available)).toBe('banks');
  });

  it('falls back to the account tab when none is named', () => {
    expect(selectedSettingsTab({}, available)).toBe('account');
  });

  it('falls back to the account tab while a plugin tab is not available', () => {
    expect(selectedSettingsTab({ tab: 'billing' }, available)).toBe('account');
  });

  it('ignores a repeated tab parameter', () => {
    expect(selectedSettingsTab({ tab: ['banks', 'general'] }, available)).toBe('account');
  });
});
