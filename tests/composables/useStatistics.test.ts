import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed } from 'vue';
import type { FrontendTransaction } from '~/types/transaction';
import { useStatistics } from '~/composables/useStatistics';

const mockTransactions = ref<FrontendTransaction[]>([]);
const mockWallets = ref<any[]>([]);

vi.mock('~/composables/useTransactions', () => ({
  useTransactions: () => ({
    transactions: mockTransactions
  })
}));

vi.mock('~/composables/useWallets', () => ({
  useWallets: () => ({
    wallets: mockWallets
  })
}));

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => ({
    getDefaultCurrency: computed(() => 'USD')
  })
}));

vi.mock('~/utils/auth', () => ({
  checkAuth: () => false
}));

vi.mock('~/services/api', () => ({
  api: {
    stats: {
      fetch: vi.fn()
    }
  }
}));

function makeTxn(overrides: Partial<FrontendTransaction>): FrontendTransaction {
  return {
    id: String(Math.random()),
    date: '2026-03-15',
    time: '10:00',
    type: 'EXPENSE',
    party: 'Test Party',
    amount: '100 USD',
    category: 'Groceries',
    wallet: 'Main Checking',
    isTransfer: false,
    ...overrides
  };
}

describe('useStatistics - transfer exclusion', () => {
  beforeEach(() => {
    mockWallets.value = [
      { id: 1, name: 'Main Checking', currency: 'USD', balance: 5000 },
      { id: 2, name: 'Savings Account', currency: 'USD', balance: 3000 }
    ];
    mockTransactions.value = [];
  });

  it('excludes transfer transactions from income and expense totals', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'INCOME', amount: '500 USD', party: 'Employer' }),
      makeTxn({ type: 'EXPENSE', amount: '200 USD', party: 'Store' }),
      makeTxn({ type: 'EXPENSE', amount: '300 USD', isTransfer: true, party: 'Transfer' }),
      makeTxn({ type: 'INCOME', amount: '300 USD', isTransfer: true, party: 'Transfer' })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    expect(stats.total_income).toBe(500);
    expect(stats.total_expenses).toBe(200);
  });

  it('excludes transfers from party breakdown', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'EXPENSE', amount: '100 USD', party: 'Store' }),
      makeTxn({ type: 'EXPENSE', amount: '250 USD', party: 'Transfer Out', isTransfer: true })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    expect(stats.party_breakdown.expense_destinations).toHaveLength(1);
    expect(stats.party_breakdown.expense_destinations[0].party).toBe('Store');
  });

  it('excludes transfers from category breakdown', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'INCOME', amount: '1000 USD', category: 'Salary' }),
      makeTxn({ type: 'INCOME', amount: '500 USD', category: 'Transfer In', isTransfer: true })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    expect(stats.category_breakdown.income_categories).toHaveLength(1);
    expect(stats.category_breakdown.income_categories[0].category).toBe('Salary');
  });

  it('excludes transfers from monthly trends', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'INCOME', amount: '1000 USD', date: '2026-03-10' }),
      makeTxn({ type: 'EXPENSE', amount: '400 USD', date: '2026-03-12' }),
      makeTxn({ type: 'EXPENSE', amount: '500 USD', date: '2026-03-15', isTransfer: true }),
      makeTxn({ type: 'INCOME', amount: '500 USD', date: '2026-03-15', isTransfer: true })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    const marchTrend = stats.time_analysis.monthly_trends.find((t) => t.month === '2026-03');
    expect(marchTrend).toBeDefined();
    expect(marchTrend!.income).toBe(1000);
    expect(marchTrend!.expenses).toBe(400);
  });

  it('excludes transfers from wallet distribution', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'INCOME', amount: '800 USD', wallet: 'Main Checking' }),
      makeTxn({ type: 'EXPENSE', amount: '200 USD', wallet: 'Main Checking' }),
      makeTxn({
        type: 'EXPENSE',
        amount: '300 USD',
        wallet: 'Main Checking',
        isTransfer: true
      }),
      makeTxn({
        type: 'INCOME',
        amount: '300 USD',
        wallet: 'Savings Account',
        isTransfer: true
      })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    const checking = stats.wallet_distribution?.find((w) => w.wallet_name === 'Main Checking');
    expect(checking).toBeDefined();
    expect(checking!.income).toBe(800);
    expect(checking!.expenses).toBe(200);

    const savings = stats.wallet_distribution?.find((w) => w.wallet_name === 'Savings Account');
    expect(savings).toBeUndefined();
  });

  it('returns correct totals when all transactions are transfers', async () => {
    mockTransactions.value = [
      makeTxn({ type: 'EXPENSE', amount: '500 USD', isTransfer: true }),
      makeTxn({ type: 'INCOME', amount: '500 USD', isTransfer: true })
    ];

    const { getStatistics } = useStatistics();
    const stats = await getStatistics(null, 'all_time');

    expect(stats.total_income).toBe(0);
    expect(stats.total_expenses).toBe(0);
    expect(stats.total_balance).toBe(0);
  });
});
