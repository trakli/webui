import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed } from 'vue';
import type { FrontendTransaction } from '~/types/transaction';
import { useStatistics } from '~/composables/useStatistics';

const mockTransactions = ref<FrontendTransaction[]>([]);
const mockWallets = ref<any[]>([]);

vi.mock('~/composables/useTransactions', () => ({
  useTransactions: () => ({ transactions: mockTransactions })
}));

vi.mock('~/composables/useWallets', () => ({
  useWallets: () => ({ wallets: mockWallets })
}));

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => ({ getDefaultCurrency: computed(() => 'USD') })
}));

vi.mock('~/utils/auth', () => ({
  checkAuth: () => true
}));

const statsData = {
  overview: {
    net_cash_flow: 100,
    total_income: 500,
    total_expenses: 400,
    savings_rate: 20,
    avg_monthly_income: 500,
    avg_monthly_expenses: 400
  },
  activity: {
    transaction_count: 5,
    unique_parties: 3,
    frequency: { per_day: 1, per_week: 7, per_month: 30 },
    busiest_day: 'Monday'
  },
  comparisons: { previous_period: { income_change_percent: 0 } },
  top_categories: { income: [], expenses: [] },
  charts: {
    party_income: [],
    party_spending: [],
    income_sources: [],
    category_spending: [],
    monthly_cash_flow: []
  }
};

const fetchMock = vi.fn();

vi.mock('~/services/api', () => ({
  api: {
    stats: {
      fetch: (...args: any[]) => fetchMock(...args)
    }
  }
}));

const ALL_SECTIONS = ['overview', 'activity', 'comparisons', 'categories', 'parties', 'cashflow'];

const requestedSections = () =>
  new Set(fetchMock.mock.calls.map((c) => c[0]?.section).filter(Boolean));

describe('useStatistics - progressive sections, dedup & cache', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ data: statsData });
  });

  it('fetches each section once across components and marks them loaded', async () => {
    const stats = useStatistics();
    useStatistics();
    useStatistics();

    await vi.waitFor(() => expect(stats.loadedSections.value.size).toBe(ALL_SECTIONS.length));

    expect(stats.isSectionLoaded('overview')).toBe(true);
    expect(requestedSections()).toEqual(new Set(ALL_SECTIONS));
    expect(fetchMock).toHaveBeenCalledTimes(ALL_SECTIONS.length);
  });

  it('deduplicates concurrent getStatistics calls and serves repeats from cache', async () => {
    const stats = useStatistics();
    await vi.waitFor(() => expect(stats.loadedSections.value.size).toBe(ALL_SECTIONS.length));
    fetchMock.mockClear();

    await Promise.all([
      stats.getStatistics(99, 'current_week'),
      stats.getStatistics(99, 'current_week'),
      stats.getStatistics(99, 'current_week')
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockClear();
    await stats.getStatistics(99, 'current_week');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshStatistics clears the cache and refetches every section', async () => {
    const stats = useStatistics();
    await vi.waitFor(() => expect(stats.loadedSections.value.size).toBe(ALL_SECTIONS.length));
    fetchMock.mockClear();

    await stats.refreshStatistics();
    await vi.waitFor(() => expect(requestedSections()).toEqual(new Set(ALL_SECTIONS)));
  });
});
