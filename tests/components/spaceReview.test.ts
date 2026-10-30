import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { ref } from 'vue';
import SpaceBudgetDetail from '@/components/space/SpaceBudgetDetail.vue';
import SpaceRowActions from '@/components/space/SpaceRowActions.vue';

beforeEach(() => vi.stubGlobal('useI18n', () => ({ t: (key: string) => key })));
afterEach(() => vi.unstubAllGlobals());

describe('shared space review regressions', () => {
  it('loads entries and history when a cached budget detail opens, then refreshes after closing', async () => {
    const budgetEntries = vi
      .fn()
      .mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 });
    const budgetPeriods = vi.fn().mockResolvedValue([]);
    const closeBudget = vi.fn().mockResolvedValue(undefined);
    const ask = vi.fn();
    vi.stubGlobal('useActiveSpace', () => ({
      space: ref({ name: 'Family' }),
      canManage: ref(true),
      canWrite: ref(true)
    }));
    vi.stubGlobal('useSpaceFinance', () => ({
      overview: ref({ budgets: [{ id: 1, progress: { period_end: '2020-01-01' } }] }),
      ready: ref(true),
      error: ref(null),
      ensure: vi.fn(),
      budgetEntries,
      budgetPeriods,
      closeBudget
    }));
    vi.stubGlobal('useSpaceConfirm', () => ({ confirming: ref(null), ask, runConfirm: vi.fn() }));
    const wrapper = shallowMount(SpaceBudgetDetail, {
      props: { id: 1 },
      global: { stubs: { ComponentLoader: { template: '<div><slot /></div>' } } }
    });
    await flushPromises();
    expect(budgetEntries).toHaveBeenCalledWith(1, 1);
    expect(budgetPeriods).toHaveBeenCalledWith(1);
    const close = wrapper
      .findAllComponents({ name: 'TButton' })
      .find((button) => button.props('text') === 'Close ended period');
    expect(close).toBeDefined();
    close!.vm.$emit('click');
    await ask.mock.calls[0]![0].action();
    expect(closeBudget).toHaveBeenCalledWith(1);
    expect(budgetEntries).toHaveBeenCalledTimes(2);
    expect(budgetPeriods).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it('shows failures from asynchronous row actions', async () => {
    const showError = vi.fn();
    const handle = vi.fn().mockReturnValue(false);
    vi.stubGlobal('useNotifications', () => ({ showError }));
    vi.stubGlobal('useUpsell', () => ({ handle }));
    const failure = new Error('Request failed');
    const run = vi.fn().mockRejectedValue(failure);
    const wrapper = shallowMount(SpaceRowActions, { props: { items: [{ label: 'Resend', run }] } });
    await wrapper.get('.trigger').trigger('click');
    await wrapper.get('[role="menuitem"]').trigger('click');
    await flushPromises();
    expect(run).toHaveBeenCalledOnce();
    expect(handle).toHaveBeenCalledWith(failure);
    expect(showError).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
