import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { computed } from 'vue';
import ChatLandingInsights from '@/components/ai/ChatLandingInsights.vue';

// WalletStatistics is app-owned (composables/useStatistics.ts, interfaces at
// lines 9-46 / 48-140). getStatistics returns it; we substitute the internal
// data provider so the component renders against the real shape without the
// /stats API. h.stats lets each test choose what getStatistics resolves to.
const h = vi.hoisted(() => ({ stats: null as unknown }));

vi.mock('@/composables/useStatistics', () => ({
  useStatistics: () => ({
    getStatistics: () => Promise.resolve(h.stats),
    formatCompactCurrency: (n: number) => `$${Math.round(n)}`
  })
}));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    getDefaultCurrency: computed(() => 'USD'),
    loadWallets: () => Promise.resolve([])
  })
}));

const richStats = {
  total_income: 1800,
  total_expenses: 1240,
  transaction_count: 24,
  income_insights: {
    biggest_source: { party: 'Acme Corp', amount: 1500, percentage: 80, transaction_count: 2 }
  },
  expense_insights: {
    biggest_category: { category: 'Food', amount: 400, percentage: 32, transaction_count: 9 },
    biggest_expense: { party: 'Grocers', amount: 320, percentage: 26, transaction_count: 5 },
    average_transaction: 52,
    top_categories: [
      { category: 'Food', amount: 400, percentage: 32, transaction_count: 9, type: 'EXPENSE' },
      { category: 'Transport', amount: 220, percentage: 18, transaction_count: 4, type: 'EXPENSE' },
      { category: 'Bills', amount: 150, percentage: 12, transaction_count: 3, type: 'EXPENSE' }
    ],
    budget_analysis: { expense_ratio: 0.69, savings_rate: 0.31, risk_level: 'low' }
  },
  time_analysis: {
    monthly_trends: [
      { month: 'Apr', income: 1700, expenses: 1300, net: 400 },
      { month: 'May', income: 1750, expenses: 1280, net: 470 },
      { month: 'Jun', income: 1800, expenses: 1240, net: 560 }
    ]
  },
  performance: { growth_percentage: 12 }
};

const emptyStats = {
  total_income: 0,
  total_expenses: 0,
  transaction_count: 0,
  income_insights: { biggest_source: null },
  expense_insights: {
    biggest_category: null,
    biggest_expense: null,
    average_transaction: 0,
    top_categories: [],
    budget_analysis: { expense_ratio: 0, savings_rate: 0, risk_level: 'low' }
  },
  time_analysis: { monthly_trends: [] },
  performance: { growth_percentage: 0 }
};

const mountLanding = async () => {
  const w = mount(ChatLandingInsights);
  await flushPromises();
  return w;
};

let wrapper: ReturnType<typeof mount> | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

describe('ChatLandingInsights', () => {
  it('renders the warm stat cards from the fetched stats', async () => {
    h.stats = richStats;
    wrapper = await mountLanding();

    expect(wrapper.findAll('.stat').length).toBeGreaterThanOrEqual(3);
    expect(wrapper.find('.empty-hint').exists()).toBe(false);

    const text = wrapper.text();
    expect(text).toContain('$560'); // net flow = 1800 - 1240
    expect(text).toContain('31'); // savings rate 0.31 -> 31%
    expect(text).toContain('Food'); // top category
    expect(text).toContain('24'); // transaction count
    expect(text).toContain('Grocers'); // biggest expense party
  });

  it('emits the spotlight prompt when the spotlight is clicked', async () => {
    h.stats = richStats;
    wrapper = await mountLanding();

    const spotlight = wrapper.find('.spotlight');
    expect(spotlight.exists()).toBe(true);

    await spotlight.trigger('click');

    const picks = wrapper.emitted('pick');
    expect(picks).toBeTruthy();
    // savings_rate > 0 makes the savings line the first spotlight (landingInsights order).
    expect(picks?.[0]?.[0]).toBe('How can I improve my savings rate?');
  });

  it('shows the new-account hint and no cards when there is no data', async () => {
    h.stats = emptyStats;
    wrapper = await mountLanding();

    expect(wrapper.find('.empty-hint').exists()).toBe(true);
    expect(wrapper.findAll('.stat').length).toBe(0);
    expect(wrapper.find('.spotlight').exists()).toBe(false);
  });
});
