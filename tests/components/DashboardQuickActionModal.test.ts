import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardQuickActionModal from '@/components/dashboard/DashboardQuickActionModal.vue';

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([
      { id: 1, name: 'Cash', currency: 'USD' },
      { id: 2, name: 'Bank', currency: 'USD' }
    ]),
    parties: ref([{ id: 5, name: 'Starbucks' }]),
    loadWallets: vi.fn(),
    loadParties: vi.fn()
  })
}));

const mocks = vi.hoisted(() => ({
  addTransaction: vi.fn(),
  refreshTransactions: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  transferCreate: vi.fn()
}));

vi.mock('@/composables/useTransactions', () => ({
  useTransactions: () => ({
    addTransaction: mocks.addTransaction,
    refreshTransactions: mocks.refreshTransactions
  })
}));
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({ showSuccess: mocks.showSuccess, showError: mocks.showError })
}));
vi.mock('@/services/api/transfersApi', () => ({
  default: { create: mocks.transferCreate },
  transfersApi: { create: mocks.transferCreate }
}));

const stubs = { teleport: true };

describe('DashboardQuickActionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addTransaction.mockResolvedValue({});
    mocks.refreshTransactions.mockResolvedValue(undefined);
    mocks.transferCreate.mockResolvedValue({});
  });

  it('sends a report prompt to the chat on submit', async () => {
    const w = mount(DashboardQuickActionModal, { props: { action: 'report' }, global: { stubs } });

    await w.find('.qa-submit').trigger('click');

    const events = w.emitted('submit');
    expect(events).toBeTruthy();
    expect((events![0][0] as { text: string }).text).toContain(
      'Build a financial report for this month'
    );
  });

  it('logs a transaction directly and emits done', async () => {
    const w = mount(DashboardQuickActionModal, { props: { action: 'log' }, global: { stubs } });

    await w.find('input[type="number"]').setValue(20);
    await w.find('.qa-submit').trigger('click');
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.addTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.addTransaction.mock.calls[0][0]).toMatchObject({ amount: '20', type: 'EXPENSE' });
    expect(w.emitted('done')).toBeTruthy();
    expect(w.emitted('submit')).toBeFalsy();
  });

  it('creates a transfer directly between two wallets', async () => {
    const w = mount(DashboardQuickActionModal, {
      props: { action: 'transfer' },
      global: { stubs }
    });

    const selects = w.findAll('select');
    await w.find('input[type="number"]').setValue(50);
    await selects[0].setValue('1');
    await selects[1].setValue('2');
    await w.find('.qa-submit').trigger('click');
    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.transferCreate).toHaveBeenCalledTimes(1);
    expect(mocks.transferCreate.mock.calls[0][0]).toMatchObject({
      amount: 50,
      from_wallet_id: 1,
      to_wallet_id: 2
    });
    expect(w.emitted('done')).toBeTruthy();
  });

  it('disables transfer submit until both wallets differ', async () => {
    const w = mount(DashboardQuickActionModal, {
      props: { action: 'transfer' },
      global: { stubs }
    });

    const selects = w.findAll('select');
    await w.find('input[type="number"]').setValue(50);
    await selects[0].setValue('1');
    await selects[1].setValue('1');

    expect(w.find('.qa-submit').attributes('disabled')).toBeDefined();
  });
});
