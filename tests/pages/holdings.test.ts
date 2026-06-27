import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import HoldingsPage from '@/pages/holdings/index.vue';
import holdingsApi from '@/services/api/holdingsApi';

vi.stubGlobal('definePageMeta', vi.fn());

vi.mock('@/services/api/holdingsApi', () => ({
  default: {
    fetchAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    refreshPrices: vi.fn(),
    search: vi.fn()
  }
}));

vi.mock('~/composables/useNotifications', () => ({
  useNotifications: () => ({
    confirmDelete: vi.fn().mockResolvedValue(true),
    showSuccess: vi.fn(),
    showError: vi.fn()
  })
}));

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => ({ getDefaultCurrency: { value: 'USD' } })
}));

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({ user: { value: { id: 7 } } })
}));

vi.mock('@/services/api/statsApi', () => ({
  default: {
    fetch: vi.fn().mockResolvedValue({
      data: { currency: 'USD', position: { holdings_value: 150000 } }
    })
  }
}));

const stubs = {
  LoadingSkeleton: { template: '<div class="skeleton" />' },
  HoldingForm: { template: '<div class="holding-form" />' },
  NuxtLink: { template: '<a><slot /></a>' }
};

describe('Holdings page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (holdingsApi.fetchAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          quantity: 0.5,
          currency: 'USD',
          unit_price: 60000,
          price_source: 'auto',
          provider: 'coingecko',
          external_ref: 'bitcoin',
          value: 30000
        },
        {
          id: 2,
          name: 'Rental flat',
          quantity: 1,
          currency: 'USD',
          unit_price: 120000,
          price_source: 'manual',
          value: 120000
        }
      ],
      totals: { holdings_value: 150000, currency: 'USD' }
    });
  });

  it('lists holdings with their values and total', async () => {
    const wrapper = mount(HoldingsPage, { global: { stubs } });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Bitcoin');
    expect(text).toContain('Rental flat');
    expect(text).toContain('Live'); // crypto source badge
    expect(text).toContain('Manual'); // manual source badge
    expect(wrapper.findAll('.hd-card').length).toBe(2);
  });

  it('refreshes prices on demand', async () => {
    (holdingsApi.refreshPrices as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const wrapper = mount(HoldingsPage, { global: { stubs } });
    await flushPromises();

    await wrapper.find('.btn--ghost').trigger('click');
    await flushPromises();

    expect(holdingsApi.refreshPrices).toHaveBeenCalled();
  });
});
