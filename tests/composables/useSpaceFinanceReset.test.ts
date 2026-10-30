import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { resetSpaceFinance, useSpaceFinanceReset } from '~/composables/useSpaceFinance';

afterEach(() => {
  resetSpaceFinance();
  vi.unstubAllGlobals();
});

describe('switching shared spaces', () => {
  it('requests the new space finances even when the page stays mounted', async () => {
    const space = ref({ slug: 'first-family' });
    const api = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal('useApi', () => api);
    vi.stubGlobal('useActiveSpace', () => ({ space }));
    vi.stubGlobal('useWorkspaces', () => ({ load: vi.fn() }));
    const scope = effectScope();
    scope.run(useSpaceFinanceReset);
    space.value = { slug: 'second-family' };
    await nextTick();
    expect(api).toHaveBeenCalledWith('/workspaces/second-family/finance');
    expect(api).toHaveBeenCalledWith('/workspaces/second-family/transactions', {
      query: { page: 1 }
    });
    scope.stop();
  });
});
