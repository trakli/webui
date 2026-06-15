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

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('useStatistics - request dedup & cache', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ data: statsData });
  });

  it('issues a single /stats request when multiple components mount it with the same params', async () => {
    // Three components each call useStatistics(); only the first registers the watcher.
    useStatistics();
    useStatistics();
    useStatistics();
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent identical requests and serves repeats from cache', async () => {
    const stats = useStatistics();
    await flush();
    fetchMock.mockClear();

    await Promise.all([
      stats.getStatistics(null, 'all_time'),
      stats.getStatistics(null, 'all_time'),
      stats.getStatistics(null, 'all_time')
    ]);
    // Same params as the watcher already fetched: served from cache, no new request.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches again for a different param set', async () => {
    const stats = useStatistics();
    await flush();
    fetchMock.mockClear();

    await stats.getStatistics(7, 'current_month');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshStatistics clears the cache and refetches', async () => {
    const stats = useStatistics();
    await flush();
    fetchMock.mockClear();

    await stats.refreshStatistics();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
