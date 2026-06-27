import { describe, it, expect } from 'vitest';
import { getCountries } from '@/utils/countries';

describe('getCountries', () => {
  it('returns an array of code/name pairs', () => {
    const list = getCountries();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(150);
    expect(list.every((c) => typeof c.code === 'string' && c.code.length === 2)).toBe(true);
    expect(list.find((c) => c.code === 'US')).toBeTruthy();
  });

  it('sorts by name', () => {
    const names = getCountries().map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
