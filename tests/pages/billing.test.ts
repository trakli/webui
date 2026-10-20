import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import BillingPage from '~/pages/billing.vue';

const request = vi.hoisted(() => vi.fn());
vi.mock('~/composables/useApi', () => ({ useApi: () => request }));
vi.stubGlobal('definePageMeta', vi.fn());
vi.stubGlobal('navigateTo', vi.fn());
const current = {
  paid_access: false,
  has_billing_account: false,
  status: 'free',
  paid_through: null,
  limits: { wallets: 3, categories: 10, bank_connections: 0 },
  ai_usage: {
    used: 0,
    allowance: 0,
    remaining: 0,
    period_start: '2026-10-01T00:00:00Z',
    period_end: '2026-11-01T00:00:00Z'
  }
};
function render() {
  return mount(BillingPage, {
    global: {
      stubs: {
        TCard: { template: '<div><slot /></div>' },
        ComponentLoader: { template: '<div><slot /></div>' },
        TButton: {
          props: ['text', 'disabled'],
          template: '<button :disabled="disabled">{{ text }}</button>'
        }
      }
    }
  });
}
beforeEach(() => {
  request.mockReset();
  vi.stubGlobal('useRoute', () => ({ query: { checkout: 'success' } }));
  request.mockImplementation((path: string) =>
    Promise.resolve({
      success: true,
      message: 'Success',
      data:
        path === '/cloud/plans'
          ? {
              trial_days: 3,
              regions: {
                us: {
                  name: 'United States',
                  currency: 'USD',
                  prices: {
                    monthly: { price: 8.99, price_formatted: '$8.99' },
                    yearly: { price: 86.28, price_formatted: '$86.28' }
                  }
                }
              }
            }
          : current
    })
  );
});
describe('billing purchase return', () => {
  it('keeps free access until the server confirms payment and shows the price', async () => {
    const page = render();
    await flushPromises();
    expect(page.text()).toContain('Free plan');
    expect(page.text()).toContain('Payment confirmation is pending');
    expect(page.text()).toContain('$8.99');
    expect(page.text()).not.toContain('Paid access active');
    expect(page.text()).not.toContain('Manage billing');
  });
  it('shows only server-confirmed access and monthly usage', async () => {
    request.mockImplementation((path: string) =>
      Promise.resolve({
        success: true,
        message: 'Success',
        data:
          path === '/cloud/plans'
            ? { trial_days: 3, regions: {} }
            : {
                ...current,
                paid_access: true,
                has_billing_account: true,
                status: 'active',
                ai_usage: { ...current.ai_usage, used: 420, allowance: 100000 }
              }
      })
    );
    const page = render();
    await flushPromises();
    expect(page.text()).toContain('Paid access active');
    expect(page.text()).toContain('420 / 100,000');
    expect(page.text()).toContain('Manage billing');
    expect(page.text()).not.toContain('Payment confirmation is pending');
  });
});
