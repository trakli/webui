import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import ChatProposedActionBlock from '@/components/ai/blocks/ChatProposedActionBlock.vue';

vi.stubGlobal('useNotifications', () => ({ showError: vi.fn() }));
vi.stubGlobal('useI18n', () => ({ t: (k: string) => k }));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([
      { id: 4, name: 'Cash' },
      { id: 5, name: 'Bank' }
    ]),
    categories: ref([
      { id: 9, name: 'Food' },
      { id: 11, name: 'Rent' }
    ]),
    parties: ref([]),
    loadWallets: vi.fn(),
    loadCategories: vi.fn(),
    loadParties: vi.fn()
  })
}));

const mockConfirm = vi.fn().mockResolvedValue({});
const mockReject = vi.fn().mockResolvedValue(undefined);
vi.mock('@/services/api/aiApi', () => ({
  aiApi: {
    confirmAction: (...args: unknown[]) => mockConfirm(...args),
    rejectAction: (...args: unknown[]) => mockReject(...args)
  }
}));

const block = () => ({
  type: 'proposed_action',
  id: 7,
  action_type: 'transaction.create',
  summary: 'Log an expense of 20 for coffee.',
  risk: 'high',
  status: 'proposed',
  confirm_url: '',
  reject_url: '',
  fields: [
    {
      key: 'type',
      label: 'Type',
      type: 'enum',
      value: 'expense',
      display: 'Expense',
      options: ['income', 'expense']
    },
    { key: 'amount', label: 'Amount', type: 'number', value: 20, display: '20' },
    { key: 'wallet_id', label: 'Wallet', type: 'wallet', value: 4, display: 'Cash' },
    { key: 'description', label: 'Description', type: 'text', value: 'coffee', display: 'coffee' }
  ]
});

const openEditor = async (w: ReturnType<typeof mount>) => {
  await w.find('.pa-icon-btn').trigger('click');
  await flushPromises();
};

describe('ChatProposedActionBlock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stays compact until the user chooses to edit', async () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });

    expect(w.findAll('.af-input').length).toBe(0);
    expect(w.text()).toContain('Log an expense of 20 for coffee.');

    await openEditor(w);
    expect(w.findAll('.af-input').length).toBe(4);
    expect(w.html()).toContain('Bank');
  });

  it('confirms as proposed when nothing was edited', async () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });

    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    const [sessionId, actionId, overrides] = mockConfirm.mock.calls[0];
    expect(sessionId).toBe(1);
    expect(actionId).toBe(7);
    // Nothing was touched, so nothing overrides the proposal.
    expect(overrides).toEqual({});
  });

  it('confirms with the edited values as overrides', async () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });
    await openEditor(w);

    await w.findAll('input[type="number"]')[0].setValue(35);
    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    const overrides = mockConfirm.mock.calls[0][2];
    expect(overrides.amount).toBe(35);
    expect(overrides.wallet_id).toBe(4);
  });

  it('names the record instead of showing its id, and never sends that back', async () => {
    const w = mount(ChatProposedActionBlock, {
      props: {
        block: {
          ...block(),
          action_type: 'transaction.categorize',
          summary: 'Categorize Flat white · XAF 500 as Coffee',
          fields: [
            {
              key: 'transaction_id',
              label: 'Transaction',
              type: 'readonly',
              value: 42,
              display: 'Flat white · XAF 500 · 3 Mar 2026'
            },
            { key: 'categories', label: 'Category', type: 'category', value: 9, display: 'Food' }
          ]
        },
        sessionId: 1
      }
    });

    expect(w.text()).toContain('Flat white · XAF 500 · 3 Mar 2026');
    expect(w.text()).not.toContain('#42');

    await openEditor(w);
    // The readonly row is context only; the category is the single editable one.
    expect(w.findAll('.af-input').length).toBe(1);

    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    const overrides = mockConfirm.mock.calls[0][2];
    expect(overrides.transaction_id).toBeUndefined();
    expect(overrides.categories).toEqual([9]);
  });

  it('sends a chosen category as a single-item list', async () => {
    const w = mount(ChatProposedActionBlock, {
      props: {
        block: {
          ...block(),
          fields: [{ key: 'categories', label: 'Category', type: 'category', value: 9 }]
        },
        sessionId: 1
      }
    });
    await openEditor(w);

    // setSelected rather than setValue: the options bind numeric ids, which a
    // raw string value would not match.
    const rent = w.findAll('option').find((o) => o.text() === 'Rent');
    await rent!.setSelected();
    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    expect(mockConfirm.mock.calls[0][2].categories).toEqual([11]);
  });

  it('keeps a provided datetime value', async () => {
    const b = block();
    b.fields.push({
      key: 'datetime',
      label: 'When',
      type: 'datetime',
      value: '2026-01-15T09:30:00',
      display: '2026-01-15T09:30:00'
    });
    const w = mount(ChatProposedActionBlock, { props: { block: b, sessionId: 1 } });
    await openEditor(w);

    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    expect(mockConfirm.mock.calls[0][2].datetime).toBe('2026-01-15T09:30');
  });

  it('dismisses without confirming', async () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });

    await w.find('.pa-dismiss').trigger('click');
    await flushPromises();

    expect(mockReject).toHaveBeenCalledWith(1, 7);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(w.find('.pa-status').text()).toContain('Dismissed');
  });

  it('shows a settled action without any buttons', () => {
    const w = mount(ChatProposedActionBlock, {
      props: { block: { ...block(), status: 'executed' }, sessionId: 1 }
    });

    expect(w.find('.pa-confirm').exists()).toBe(false);
    expect(w.find('.pa-status').text()).toContain('Done');
  });
});
