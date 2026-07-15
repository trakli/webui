import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TransactionForm from '@/components/TransactionForm.vue';

vi.mock('@/services/api', () => ({
  api: {
    transactions: {
      fetchFileBlob: vi.fn().mockResolvedValue(new Blob(['x'], { type: 'image/png' })),
      deleteFile: vi.fn().mockResolvedValue({})
    }
  }
}));

const mockSharedData = {
  parties: ref([
    { id: 1, name: 'Grocery Store' },
    { id: 2, name: 'Gas Station' }
  ]),
  groups: ref([
    { id: 1, name: 'Food & Dining' },
    { id: 2, name: 'Transportation' }
  ]),
  wallets: ref([
    { id: 1, name: 'Main Wallet', currency: 'USD' },
    { id: 2, name: 'Savings', currency: 'USD' }
  ]),
  getExpenseCategories: ref([
    { id: 1, name: 'Groceries', type: 'expense' },
    { id: 2, name: 'Gas', type: 'expense' }
  ]),
  getIncomeCategories: ref([
    { id: 3, name: 'Salary', type: 'income' },
    { id: 4, name: 'Freelance', type: 'income' }
  ]),
  getDefaultCurrency: ref('USD'),
  getDefaultWallet: ref({ id: 1, name: 'Main Wallet', currency: 'USD' }),
  getDefaultGroup: ref({ id: 1, name: 'Food & Dining' }),
  loadAllData: vi.fn().mockResolvedValue(undefined),
  formatWalletName: (wallet: { name: string; currency?: string }) =>
    wallet.currency ? `${wallet.name} (${wallet.currency})` : wallet.name
};

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => mockSharedData
}));

const stubs = {
  TButton: {
    template:
      '<button @click="$emit(\'click\')">{{ text }}<slot /><slot name="left-icon" /></button>',
    props: ['text']
  },
  SearchableDropdown: {
    template:
      '<div class="searchable-dropdown"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot /></div>',
    props: ['modelValue', 'label', 'options', 'placeholder', 'multiple', 'error', 'disabled'],
    emits: ['update:modelValue', 'select']
  },
  CheckIcon: { template: '<span class="check-icon" />' },
  PencilIcon: { template: '<span class="pencil-icon" />' }
};

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the form with all required fields', () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      expect(wrapper.find('input[type="number"]').exists()).toBe(true);
      expect(wrapper.find('textarea').exists()).toBe(true);
      expect(wrapper.find('input[type="date"]').exists()).toBe(true);
      expect(wrapper.find('input[type="time"]').exists()).toBe(true);
      expect(wrapper.find('select').exists()).toBe(true);
    });

    it('shows "Record expense" button when isOutcomeSelected is true', () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Record expense');
    });

    it('shows "Record income" button when isOutcomeSelected is false', () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: false },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Record income');
    });

    it('shows "Update expense" button when editing an expense', () => {
      const wrapper = mount(TransactionForm, {
        props: {
          isOutcomeSelected: true,
          editingItem: { id: 1, amount: '100 USD' }
        },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Update expense');
    });

    it('shows "Update income" button when editing an income', () => {
      const wrapper = mount(TransactionForm, {
        props: {
          isOutcomeSelected: false,
          editingItem: { id: 1, amount: '100 USD' }
        },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Update income');
    });
  });

  describe('form fields', () => {
    it('initializes with current date', () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      const dateInput = wrapper.find('input[type="date"]');
      const today = new Date().toISOString().slice(0, 10);
      expect(dateInput.element.value).toBe(today);
    });

    it('allows entering amount', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      const amountInput = wrapper.find('input[type="number"]');
      await amountInput.setValue('250');
      expect(amountInput.element.value).toBe('250');
    });

    it('allows entering description', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Grocery shopping');
      expect(textarea.element.value).toBe('Grocery shopping');
    });

    it('has currency selector with available currencies', () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      const select = wrapper.find('select');
      const options = select.findAll('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('validation', () => {
    it('shows error when amount is empty on submit', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('shows error when amount is zero', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('0');
      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('shows error when amount is negative', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('-50');
      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('does not emit submit when validation fails', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });

  describe('form submission', () => {
    it('emits submit with correct payload for expense', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      await wrapper.find('textarea').setValue('Test expense');
      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.type).toBe('EXPENSE');
      expect(payload.amount).toContain('100');
    });

    it('emits submit with correct payload for income', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: false },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('500');
      await wrapper.find('textarea').setValue('Test income');
      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.type).toBe('INCOME');
      expect(payload.amount).toContain('500');
    });

    it('defaults intent to regular and submits the chosen intent', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: false },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('5000');

      const pills = wrapper.findAll('.intent-pill');
      expect(pills.length).toBeGreaterThan(1);

      // Pick the "Loan received" intent (income side).
      const loanPill = pills.find((p) => p.text().includes('Loan received'));
      expect(loanPill).toBeTruthy();
      await loanPill!.trigger('click');

      await wrapper.find('.submit-button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.intent).toBe('loan_received');
    });

    it('only offers income-side intents when recording income', () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: false },
        global: { stubs }
      });

      const labels = wrapper.findAll('.intent-pill').map((p) => p.text());
      expect(labels).toContain('Loan received');
      expect(labels).not.toContain('Loan repayment');
    });

    it('includes id in payload when editing', async () => {
      const wrapper = mount(TransactionForm, {
        props: {
          isOutcomeSelected: true,
          editingItem: { id: 123, amount: '100 USD' }
        },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('150');
      await wrapper.find('.submit-button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.id).toBe(123);
    });
  });

  describe('file attachments', () => {
    const setFiles = async (wrapper: ReturnType<typeof mount>, files: File[]) => {
      const input = wrapper.find('input[type="file"]');
      Object.defineProperty(input.element, 'files', { value: files, configurable: true });
      await input.trigger('change');
      await flushPromises();
    };

    it('renders file upload section', () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      expect(wrapper.find('input[type="file"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('Browse files');
    });

    it('shows hint for file types', () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Images, PDFs or docs');
    });

    it('renders a card with the filename when a file is picked', async () => {
      const wrapper = mount(TransactionForm, { global: { stubs } });

      await setFiles(wrapper, [new File(['x'], 'receipt.png', { type: 'image/png' })]);

      expect(wrapper.text()).toContain('receipt.png');
    });

    it('appends to the existing selection when picking again', async () => {
      const wrapper = mount(TransactionForm, { global: { stubs } });

      await setFiles(wrapper, [new File(['x'], 'first.png', { type: 'image/png' })]);
      await setFiles(wrapper, [new File(['x'], 'second.pdf', { type: 'application/pdf' })]);

      const text = wrapper.text();
      expect(text).toContain('first.png');
      expect(text).toContain('second.pdf');
    });

    it('removes a picked attachment when its remove button is clicked', async () => {
      const wrapper = mount(TransactionForm, { global: { stubs } });

      await setFiles(wrapper, [new File(['x'], 'remove-me.png', { type: 'image/png' })]);
      expect(wrapper.text()).toContain('remove-me.png');

      await wrapper.find('.attachment-card .remove').trigger('click');

      expect(wrapper.text()).not.toContain('remove-me.png');
    });

    it('emits the picked File objects in the submit payload', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      await setFiles(wrapper, [new File(['x'], 'photo.jpg', { type: 'image/jpeg' })]);

      const buttons = wrapper.findAll('button');
      await buttons[buttons.length - 1].trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.filesToUpload).toHaveLength(1);
      expect(payload.filesToUpload[0]).toBeInstanceOf(File);
      expect(payload.filesToUpload[0].name).toBe('photo.jpg');
    });

    it('caps selections at five total attachments across new and saved files', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      const eight = Array.from(
        { length: 8 },
        (_, i) => new File(['x'], `f${i}.png`, { type: 'image/png' })
      );
      await setFiles(wrapper, eight);

      const buttons = wrapper.findAll('button');
      await buttons[buttons.length - 1].trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.filesToUpload).toHaveLength(5);
    });

    it('renders saved attachments from editingItem.files when editing', async () => {
      const wrapper = mount(TransactionForm, {
        props: {
          editingItem: {
            id: 1,
            amount: '100 USD',
            files: [{ id: 10, path: 'transactions/receipt.pdf', type: 'pdf' }]
          }
        },
        global: { stubs }
      });

      await flushPromises();

      // Non-image attachments render an extension-derived label tile.
      expect(wrapper.text()).toContain('PDF');
    });
  });

  describe('editing mode', () => {
    it('populates form with existing data when editing', async () => {
      const wrapper = mount(TransactionForm, {
        props: {
          editingItem: {
            id: 1,
            date: '2025-01-15',
            time: '14:30',
            amount: '250.50 USD',
            description: 'Test transaction'
          }
        },
        global: { stubs }
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('input[type="date"]').element.value).toBe('2025-01-15');
      expect(wrapper.find('input[type="time"]').element.value).toBe('14:30');
      expect(wrapper.find('textarea').element.value).toBe('Test transaction');
    });
  });

  describe('category selection', () => {
    // A transaction holds one category, so the dropdown is single-select and
    // hands back the chosen option rather than a list of ids.
    const categoryDropdownStub = (onSetup: (props: any, emit: any) => void = () => {}) => ({
      ...stubs,
      SearchableDropdown: {
        template: '<div class="searchable-dropdown"><input /></div>',
        props: ['modelValue', 'label', 'options', 'placeholder', 'error', 'disabled'],
        emits: ['update:modelValue', 'select'],
        setup(props: any, { emit }: any) {
          onSetup(props, emit);
          return {};
        }
      }
    });

    it('includes the chosen category in the submit payload', async () => {
      let selectCategory: (() => void) | null = null;

      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: {
          stubs: categoryDropdownStub((props, emit) => {
            if (props.label === 'Category') {
              selectCategory = () => emit('select', { id: 2, name: 'Gas', type: 'expense' });
            }
          })
        }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      selectCategory?.();
      await wrapper.find('.submit-button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0] as any;
      expect(payload.categoryIds).toEqual([2]);
    });

    it('replaces the category rather than accumulating them', async () => {
      let emitSelect: ((option: unknown) => void) | null = null;

      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: {
          stubs: categoryDropdownStub((props, emit) => {
            if (props.label === 'Category') {
              emitSelect = (option: unknown) => emit('select', option);
            }
          })
        }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      emitSelect?.({ id: 1, name: 'Groceries', type: 'expense' });
      emitSelect?.({ id: 2, name: 'Gas', type: 'expense' });
      await wrapper.find('.submit-button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0] as any;
      expect(payload.categoryIds).toEqual([2]);
    });

    it('includes empty categoryIds array when no category selected', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      await wrapper.find('.submit-button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0] as any;
      expect(payload.categoryIds).toEqual([]);
    });

    it('keeps only the first category of a transaction saved before the limit', async () => {
      const wrapper = mount(TransactionForm, {
        props: {
          isOutcomeSelected: true,
          editingItem: { id: 1, amount: '100 USD', categoryIds: [1, 2] }
        },
        global: { stubs }
      });

      await wrapper.vm.$nextTick();
      await wrapper.find('.submit-button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0] as any;
      expect(payload.categoryIds).toEqual([1]);
    });
  });
});
