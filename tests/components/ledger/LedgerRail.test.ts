import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import LedgerRail from '@/components/ledger/LedgerRail.vue';

const space = ref<Record<string, unknown> | null>(null);
const isOwner = ref(false);
let path = '/dashboard';

vi.stubGlobal('useActiveSpace', () => ({ space, isOwner }));
vi.stubGlobal('useExtensionSlots', () => ({ resolveComponent: () => null }));
vi.stubGlobal('useRoute', () => ({ path, query: {}, params: {} }));

const NuxtLink = {
  props: ['to'],
  template: '<a :href="to" v-bind="$attrs"><slot /></a>'
};

const mountRail = () => mount(LedgerRail, { global: { stubs: { NuxtLink } } });

afterEach(() => {
  space.value = null;
  path = '/dashboard';
});

describe('LedgerRail', () => {
  it('lists the personal screens, with Shared spaces reachable', () => {
    const keys = mountRail()
      .findAll('[data-rail]')
      .map((link) => link.attributes('data-rail'));
    expect(keys).toEqual([
      'overview',
      'ask',
      'ledger',
      'wallets',
      'reports',
      'budgets',
      'people',
      'imports',
      'shared',
      'settings'
    ]);
  });

  it('marks the assistant as current on the discussions page too', () => {
    path = '/assistant';
    const ask = mountRail().find('[data-rail="ask"]');
    expect(ask.attributes('aria-current')).toBe('page');
  });

  it('shows only what a shared space supports, plus its members', () => {
    space.value = { id: 1, slug: 'family', name: 'Family' };
    const keys = mountRail()
      .findAll('[data-rail]')
      .map((link) => link.attributes('data-rail'));
    expect(keys).toContain('members');
    expect(keys).not.toContain('people');
    expect(keys).not.toContain('shared');
  });
});
