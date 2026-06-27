import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([{ id: 1, name: 'Cash', currency: 'USD' }]),
    categories: ref([]),
    groups: ref([])
  })
}));

describe('BudgetForm currency options', () => {
  it('offers every supported currency, not just wallet currencies', () => {
    const wrapper = mount(BudgetForm);
    const codes = wrapper.findAll('select.currency option').map((o) => o.text());

    expect(codes).toContain('USD'); // the user's wallet currency
    expect(codes).toContain('EUR'); // not a wallet currency
    expect(codes).toContain('XAF'); // not a wallet currency
    expect(codes.length).toBeGreaterThan(1);
  });

  it('surfaces the user wallet currency first', () => {
    const wrapper = mount(BudgetForm);
    const codes = wrapper.findAll('select.currency option').map((o) => o.text());

    expect(codes[0]).toBe('USD');
  });
});
