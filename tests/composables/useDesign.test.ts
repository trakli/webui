import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, type Ref } from 'vue';
import { useDesign } from '~/composables/useDesign';

let cookie: { value: string | null };
let states: Map<string, Ref<unknown>>;

beforeEach(() => {
  cookie = { value: null };
  states = new Map();
  vi.stubGlobal('useCookie', () => cookie);
  vi.stubGlobal('useState', (key: string, init: () => unknown) => {
    if (!states.has(key)) states.set(key, ref(init()));
    return states.get(key);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useDesign', () => {
  it('uses the Ledger design when nothing is stored', () => {
    expect(useDesign().design.value).toBe('ledger');
  });

  it('keeps the Classic design once chosen', () => {
    useDesign().setDesign('classic');
    expect(cookie.value).toBe('classic');
    expect(useDesign().isLedger.value).toBe(false);
  });

  it('falls back to Ledger when the stored value is unknown', () => {
    cookie.value = 'neon';
    expect(useDesign().design.value).toBe('ledger');
  });

  it('takes the design from a ?design= query so screenshot runs can pick one', () => {
    const { applyQuery } = useDesign();
    applyQuery('classic');
    expect(cookie.value).toBe('classic');
    applyQuery(['ledger']);
    expect(cookie.value).toBe('ledger');
  });

  it('lets the layout see a design another caller set during the same render', () => {
    cookie.value = 'classic';
    useDesign().applyQuery('ledger');
    cookie.value = 'classic';
    expect(useDesign().design.value).toBe('ledger');
  });

  it('ignores a query value that is not a design', () => {
    cookie.value = 'classic';
    useDesign().applyQuery('dark');
    expect(cookie.value).toBe('classic');
  });
});
