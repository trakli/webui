import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FinancialPositionView from '@/components/financial-position/FinancialPositionView.vue';
import { statsApi } from '@/services/api/statsApi';
import transactionApi from '@/services/transactionApi';

vi.mock('@/services/api/statsApi', () => ({
  statsApi: { fetch: vi.fn() }
}));

vi.mock('@/services/transactionApi', () => ({
  default: { fetchAll: vi.fn() }
}));

const position = {
  earned_income: 5000,
  discretionary_spend: 500,
  loan_received: 3000,
  loan_repayment: 1000,
  debt_owed: 0,
  debt_settled: 0,
  loans_debt_net: 2000,
  investment_principal: 2000,
  investment_returns: 400,
  gifts_received: 100,
  net_worth_delta: 5000,
  cash_balance: 8000,
  holdings_value: 12000,
  total_net_worth: 20000
};

const stubs = {
  LoadingSkeleton: { template: '<div class="skeleton" />' },
  NuxtLink: { template: '<a><slot /></a>' }
};

describe('FinancialPositionView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (statsApi.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { currency: 'USD', position }
    });
    (transactionApi.fetchAll as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });
  });

  it('requests the position section', async () => {
    mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    expect(statsApi.fetch).toHaveBeenCalledWith(expect.objectContaining({ section: 'position' }));
  });

  it('leads with the net worth result', async () => {
    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Net worth change');
    expect(text).toContain('Building'); // net_worth_delta 5000 > 0
    expect(text).toContain('+5K');
  });

  it('shows total net worth as cash plus holdings', async () => {
    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Total net worth now');
    expect(text).toContain('20K'); // total_net_worth 20000
    expect(text).toContain('Cash');
    expect(text).toContain('Holdings');
  });

  it('organises every intent stream into money in and money out', async () => {
    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Money in');
    expect(text).toContain('Money out');
    // in: earned, returns, gifts, loan received (debt_owed 0 is dropped)
    // out: discretionary spend, invested, loan repayment (debt_settled 0 dropped)
    expect(text).toContain('Earned income');
    expect(text).toContain('Invested'); // investing shows as money out
    expect(text).toContain('Loan received');
    expect(wrapper.findAll('.fp-row').length).toBe(7);
  });

  it('marks borrowed and invested cash as not affecting net worth', async () => {
    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    expect(wrapper.findAll('.fp-row--neutral').length).toBe(3); // loan in, invested, loan repayment
  });

  it('drills into a single intent stream, excluding transfers', async () => {
    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    const row = wrapper.findAll('.fp-row').find((node) => node.text().includes('Invested'));
    expect(row).toBeTruthy();
    await row!.trigger('click');
    await flushPromises();

    expect(transactionApi.fetchAll).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: 'investment_buy',
        exclude_transfers: true,
        type: 'expense'
      })
    );
  });

  it('shows the underlying transactions in the detail drawer', async () => {
    (transactionApi.fetchAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        {
          id: 1,
          type: 'expense',
          intent: 'investment_buy',
          amount: 2000,
          datetime: '2026-05-10T10:00:00.000Z',
          wallet: { currency: 'USD' },
          party: { name: 'Brokerage' },
          description: 'Index fund'
        }
      ]
    });

    const wrapper = mount(FinancialPositionView, { global: { stubs } });
    await flushPromises();

    const row = wrapper.findAll('.fp-row').find((node) => node.text().includes('Invested'));
    await row!.trigger('click');
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Index fund');
    expect(wrapper.findAll('.row').length).toBe(1);
  });

  it('passes provided params through to the fetch', async () => {
    mount(FinancialPositionView, {
      props: { params: { start_date: '2026-01-01', end_date: '2026-01-31' } },
      global: { stubs }
    });
    await flushPromises();

    expect(statsApi.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        section: 'position',
        start_date: '2026-01-01',
        end_date: '2026-01-31'
      })
    );
  });
});
