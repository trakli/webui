import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import ChatProposedActionBlock from '@/components/ai/blocks/ChatProposedActionBlock.vue';

vi.stubGlobal('useNotifications', () => ({ showError: vi.fn() }));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([
      { id: 4, name: 'Cash' },
      { id: 5, name: 'Bank' }
    ]),
    categories: ref([{ id: 9, name: 'Food' }]),
    loadWallets: vi.fn(),
    loadCategories: vi.fn()
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

describe('ChatProposedActionBlock (editable review form)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the fields as editable inputs', () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });
    expect(w.findAll('.pa-input').length).toBe(4);
    // wallet select offers the user's wallets
    expect(w.html()).toContain('Bank');
  });

  it('confirms with the edited values as overrides', async () => {
    const w = mount(ChatProposedActionBlock, { props: { block: block(), sessionId: 1 } });
    const amount = w.findAll('input[type="number"]')[0];
    await amount.setValue(35);

    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    const [sessionId, actionId, overrides] = mockConfirm.mock.calls[0];
    expect(sessionId).toBe(1);
    expect(actionId).toBe(7);
    expect(overrides.amount).toBe(35);
    expect(overrides.wallet_id).toBe(4);
  });

  it('omits an untouched blank datetime from overrides', async () => {
    const b = block();
    b.fields.push({
      key: 'datetime',
      label: 'When',
      type: 'datetime',
      value: null,
      display: 'Now'
    });
    const w = mount(ChatProposedActionBlock, { props: { block: b, sessionId: 1 } });

    await w.find('.pa-confirm').trigger('click');
    await flushPromises();

    const overrides = mockConfirm.mock.calls[0][2];
    // A blank "When" must not be sent (it would record as 01/01/1970); other
    // fields still go through.
    expect('datetime' in overrides).toBe(false);
    expect(overrides.amount).toBe(20);
  });
});
