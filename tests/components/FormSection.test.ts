import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import FormSection from '@/components/FormSection.vue';

const mockSharedData = {
  parties: ref([]),
  groups: ref([{ id: 1, name: 'Default Group' }]),
  wallets: ref([{ id: 1, name: 'Main Wallet', currency: 'USD' }]),
  getExpenseCategories: ref([]),
  getIncomeCategories: ref([]),
  getDefaultCurrency: ref('USD'),
  getDefaultWallet: ref({ id: 1, name: 'Main Wallet', currency: 'USD' }),
  getDefaultGroup: ref({ id: 1, name: 'Default Group' }),
  loadAllData: vi.fn().mockResolvedValue(undefined)
};

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => mockSharedData
}));

const stubs = {
  TransactionFormContainer: {
    template: '<div class="transaction-form-container" :data-is-expense="isOutcomeSelected">Form</div>',
    props: ['isOutcomeSelected', 'editingItem']
  },
  TipsSection: {
    template: '<div class="tips-section">Tips</div>',
    props: ['pageName']
  },
  ArrowDownTrayIcon: { template: '<span class="arrow-down-icon" />' },
  ArrowUpTrayIcon: { template: '<span class="arrow-up-icon" />' }
};

describe('FormSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tab order', () => {
    it('renders expense tab first', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const tabs = wrapper.findAll('.tab-button');
      expect(tabs.length).toBe(2);
      expect(tabs[0].text()).toContain('Expense Transaction');
      expect(tabs[1].text()).toContain('Income Transaction');
    });

    it('has expense tab with correct class', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const expenseTab = wrapper.find('.tab-button--expense');
      expect(expenseTab.exists()).toBe(true);
      expect(expenseTab.text()).toContain('Expense');
    });

    it('has income tab with correct class', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const incomeTab = wrapper.find('.tab-button--income');
      expect(incomeTab.exists()).toBe(true);
      expect(incomeTab.text()).toContain('Income');
    });
  });

  describe('default state', () => {
    it('has expense tab selected by default', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const expenseTab = wrapper.find('.tab-button--expense');
      expect(expenseTab.classes()).toContain('active');
    });

    it('has income tab not selected by default', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const incomeTab = wrapper.find('.tab-button--income');
      expect(incomeTab.classes()).not.toContain('active');
    });

    it('passes isOutcomeSelected=true to form by default', () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const form = wrapper.find('.transaction-form-container');
      expect(form.attributes('data-is-expense')).toBe('true');
    });
  });

  describe('tab switching', () => {
    it('switches to income tab when clicked', async () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const incomeTab = wrapper.find('.tab-button--income');
      await incomeTab.trigger('click');

      expect(incomeTab.classes()).toContain('active');
      expect(wrapper.find('.tab-button--expense').classes()).not.toContain('active');
    });

    it('switches to expense tab when clicked', async () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      const incomeTab = wrapper.find('.tab-button--income');
      await incomeTab.trigger('click');

      const expenseTab = wrapper.find('.tab-button--expense');
      await expenseTab.trigger('click');

      expect(expenseTab.classes()).toContain('active');
      expect(incomeTab.classes()).not.toContain('active');
    });

    it('updates form isOutcomeSelected when switching to income', async () => {
      const wrapper = mount(FormSection, {
        global: { stubs }
      });

      await wrapper.find('.tab-button--income').trigger('click');

      const form = wrapper.find('.transaction-form-container');
      expect(form.attributes('data-is-expense')).toBe('false');
    });
  });

  describe('editing mode', () => {
    it('selects expense tab when editing an expense transaction', async () => {
      const wrapper = mount(FormSection, {
        props: {
          editingItem: { id: 1, type: 'EXPENSE', amount: '100 USD' }
        },
        global: { stubs }
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.tab-button--expense').classes()).toContain('active');
      expect(wrapper.find('.tab-button--income').classes()).not.toContain('active');
    });

    it('selects income tab when editing an income transaction', async () => {
      const wrapper = mount(FormSection, {
        props: {
          editingItem: { id: 1, type: 'INCOME', amount: '100 USD' }
        },
        global: { stubs }
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('.tab-button--income').classes()).toContain('active');
      expect(wrapper.find('.tab-button--expense').classes()).not.toContain('active');
    });
  });

  describe('form submission', () => {
    it('emits submit event when form submits', async () => {
      const wrapper = mount(FormSection, {
        global: {
          stubs: {
            ...stubs,
            TransactionFormContainer: {
              template: '<div class="mock-form" @click="$emit(\'submit\', { type: \'EXPENSE\' })">Form</div>',
              props: ['isOutcomeSelected', 'editingItem'],
              emits: ['submit']
            }
          }
        }
      });

      await wrapper.find('.mock-form').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });
});
