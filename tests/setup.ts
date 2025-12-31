import { vi } from 'vitest';

// Mock useI18n globally
vi.stubGlobal('useI18n', () => ({
  t: (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key;
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
      return result;
    }
    return key;
  },
  locale: { value: 'en' },
  setLocale: vi.fn()
}));
