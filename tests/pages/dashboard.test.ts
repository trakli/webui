import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardKPIs from '@/components/dashboard/DashboardKPIs.vue';

const mockStatistics = {
  total_balance: 5000,
  total_income: 8000,
  total_expenses: 3000,
  top_categories: [
    { name: 'Food', amount: 1200 },
    { name: 'Transport', amount: 800 }
  ]
};

const mockUseStatistics = {
  currentStatistics: ref(mockStatistics),
  currentPeriod: ref('month'),
  customFilters: ref(null),
  isLoading: ref(false),
  error: ref(null),
  selectedWalletId: ref(null),
  availableWallets: ref([
    { id: null, name: 'All Wallets' },
    { id: 1, name: 'Main Wallet' }
  ]),
  formatCompactCurrency: (val: number) => `$${val.toLocaleString()}`,
  setSelectedWallet: vi.fn(),
  setCustomFilters: vi.fn(),
  clearCustomFilters: vi.fn(),
  setPeriod: vi.fn()
};

vi.mock('@/composables/useStatistics', () => ({
  useStatistics: () => mockUseStatistics
}));

vi.mock('@/composables/useWallets', () => ({
  useWallets: () => ({
    wallets: ref([])
  })
}));

vi.mock('@/composables/useTransactions', () => ({
  useTransactions: () => ({
    transactions: ref([]),
    recentTransactions: ref([]),
    isLoading: ref(false)
  })
}));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    loadAllData: vi.fn(),
    getDefaultCurrency: ref('USD')
  })
}));

const stubs = {
  ChevronDown: { template: '<span />' },
  XIcon: { template: '<span />' },
  NuxtLink: { template: '<a><slot /></a>' }
};

describe('DashboardKPIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders KPI cards', () => {
      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      expect(wrapper.find('.kpi-grid').exists()).toBe(true);
      expect(wrapper.findAll('.kpi-card').length).toBe(4);
    });

    it('displays Balance KPI', () => {
      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Balance');
      expect(wrapper.text()).toContain('5,000');
    });

    it('displays Income KPI with positive styling', () => {
      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Income');
      expect(wrapper.text()).toContain('8,000');
      expect(wrapper.find('.kpi-card.surface--income').exists()).toBe(true);
    });

    it('displays Expenses KPI with negative styling', () => {
      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Expenses');
      expect(wrapper.text()).toContain('3,000');
      expect(wrapper.find('.kpi-card.surface--expense').exists()).toBe(true);
    });

    it('displays Net value (income - expenses)', () => {
      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Net');
      expect(wrapper.text()).toContain('5,000');
    });
  });

  describe('net value styling', () => {
    it('applies positive surface when net is positive', () => {
      mockUseStatistics.currentStatistics.value = {
        ...mockStatistics,
        total_income: 5000,
        total_expenses: 2000
      };

      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      const netCard = wrapper.findAll('.kpi-card')[3];
      expect(netCard.classes()).toContain('surface--brand-soft');
    });

    it('applies negative surface when net is negative', () => {
      mockUseStatistics.currentStatistics.value = {
        ...mockStatistics,
        total_income: 2000,
        total_expenses: 5000
      };

      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      const netCard = wrapper.findAll('.kpi-card')[3];
      expect(netCard.classes()).toContain('surface--expense');
    });
  });

  describe('empty state', () => {
    it('displays zero values when no statistics', () => {
      mockUseStatistics.currentStatistics.value = null;

      const wrapper = mount(DashboardKPIs, {
        global: { stubs }
      });

      const values = wrapper.findAll('.kpi-value');
      values.forEach((value) => {
        expect(value.text()).toContain('0');
      });
    });
  });
});
