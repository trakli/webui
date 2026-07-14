import { describe, it, expect } from 'vitest';
import { SUGGESTIONS, pickSuggestions, type Suggestion } from '@/utils/landingSuggestions';

describe('landing suggestions', () => {
  it('ships a large pool', () => {
    expect(SUGGESTIONS.length).toBeGreaterThanOrEqual(90);
  });

  it('every entry has prompt text and an icon name', () => {
    for (const s of SUGGESTIONS) {
      expect(s.text.trim()).toBeTruthy();
      expect(s.icon.trim()).toBeTruthy();
    }
  });

  it('picks the requested number of distinct prompts', () => {
    const picked = pickSuggestions(6);
    expect(picked).toHaveLength(6);
    expect(new Set(picked.map((s) => s.text)).size).toBe(6);
  });

  it('never returns more than the pool holds', () => {
    const picked = pickSuggestions(9999);
    expect(picked).toHaveLength(SUGGESTIONS.length);
  });

  it('varies the selection with the random source', () => {
    // A fixed rng makes the shuffle deterministic so we can assert it reorders.
    const pool: Suggestion[] = [
      { text: 'a', icon: 'X' },
      { text: 'b', icon: 'X' },
      { text: 'c', icon: 'X' }
    ];
    const front = pickSuggestions(3, () => 0, pool).map((s) => s.text);
    const stay = pickSuggestions(3, () => 0.999, pool).map((s) => s.text);
    expect(front).not.toEqual(stay);
  });
});
