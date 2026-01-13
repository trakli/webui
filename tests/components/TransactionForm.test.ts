import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import TransactionForm from '@/components/TransactionForm.vue';

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
  loadAllData: vi.fn().mockResolvedValue(undefined)
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

      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('shows error when amount is zero', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('0');
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('shows error when amount is negative', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('-50');
      await wrapper.find('button').trigger('click');

      expect(wrapper.text()).toContain('Enter a valid amount greater than 0');
    });

    it('does not emit submit when validation fails', async () => {
      const wrapper = mount(TransactionForm, {
        global: { stubs }
      });

      await wrapper.find('button').trigger('click');

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
      await wrapper.find('button').trigger('click');

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
      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.type).toBe('INCOME');
      expect(payload.amount).toContain('500');
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
      await wrapper.find('button').trigger('click');

      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.id).toBe(123);
    });
  });

  describe('file attachments', () => {
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
    it('includes categoryIds in submit payload when categories selected', async () => {
      let capturedSelectHandler: ((ids: number[]) => void) | null = null;

      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: {
          stubs: {
            ...stubs,
            SearchableDropdown: {
              template: '<div class="searchable-dropdown"><input /></div>',
              props: [
                'modelValue',
                'label',
                'options',
                'placeholder',
                'multiple',
                'error',
                'disabled',
                'selected'
              ],
              emits: ['update:modelValue', 'select'],
              setup(props: any, { emit }: any) {
                if (props.multiple) {
                  capturedSelectHandler = (ids: number[]) => emit('select', ids);
                }
                return {};
              }
            }
          }
        }
      });

      await wrapper.find('input[type="number"]').setValue('100');

      // Simulate category selection
      if (capturedSelectHandler) {
        capturedSelectHandler([1, 2]);
      }

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.categoryIds).toEqual([1, 2]);
    });

    it('includes empty categoryIds array when no categories selected', async () => {
      const wrapper = mount(TransactionForm, {
        props: { isOutcomeSelected: true },
        global: { stubs }
      });

      await wrapper.find('input[type="number"]').setValue('100');
      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      const payload = wrapper.emitted('submit')?.[0]?.[0];
      expect(payload.categoryIds).toEqual([]);
    });

    it('passes selected prop to category SearchableDropdown when editing', async () => {
      let receivedSelectedProp: number[] | null = null;

      const wrapper = mount(TransactionForm, {
        props: {
          isOutcomeSelected: true,
          editingItem: {
            id: 1,
            amount: '100 USD',
            categoryIds: [1, 2]
          }
        },
        global: {
          stubs: {
            ...stubs,
            SearchableDropdown: {
              template: '<div class="searchable-dropdown"><input /></div>',
              props: [
                'modelValue',
                'label',
                'options',
                'placeholder',
                'multiple',
                'error',
                'disabled',
                'selected'
              ],
              emits: ['update:modelValue', 'select'],
              setup(props: any) {
                if (props.multiple && props.selected) {
                  receivedSelectedProp = props.selected;
                }
                return {};
              }
            }
          }
        }
      });

      await wrapper.vm.$nextTick();

      expect(receivedSelectedProp).toEqual([1, 2]);
    });
  });
});
