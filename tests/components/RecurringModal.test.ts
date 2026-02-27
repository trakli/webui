import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecurringModal from '@/components/modals/RecurringModal.vue';

const stubs = {
  XIcon: { template: '<span class="x-icon" />' },
  RefreshCwIcon: { template: '<span class="refresh-icon" />' }
};

vi.mock('lucide-vue-next', () => ({
  X: { template: '<span class="x-icon" />' },
  RefreshCw: { template: '<span class="refresh-icon" />' }
}));

describe('RecurringModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('does not render when isOpen is false', () => {
      const wrapper = mount(RecurringModal, {
        props: { isOpen: false },
        global: { stubs }
      });
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);
    });

    it('renders when isOpen is true', () => {
      const wrapper = mount(RecurringModal, {
        props: { isOpen: true },
        global: { stubs }
      });
      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
      expect(wrapper.find('.modal-content').exists()).toBe(true);
    });

    it('shows "Make recurring" title for non-recurring transaction', () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });
      expect(wrapper.find('.modal-title').text()).toBe('Make recurring');
    });

    it('shows "Update recurrence" title for recurring transaction', () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: {
            id: '1',
            isRecurring: true,
            recurrencePeriod: 'monthly',
            recurrenceInterval: 1
          }
        },
        global: { stubs }
      });
      expect(wrapper.find('.modal-title').text()).toBe('Update recurrence');
    });

    it('shows current recurrence status for recurring transaction', () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: {
            id: '1',
            isRecurring: true,
            recurrencePeriod: 'weekly',
            recurrenceInterval: 2
          }
        },
        global: { stubs }
      });
      expect(wrapper.find('.current-status').exists()).toBe(true);
      expect(wrapper.find('.status-text').text()).toContain('2');
    });

    it('does not show current status for non-recurring transaction', () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });
      expect(wrapper.find('.current-status').exists()).toBe(false);
    });

    it('shows remove button only for recurring transactions', () => {
      const nonRecurring = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });
      expect(nonRecurring.find('.btn-danger').exists()).toBe(false);

      const recurring = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: {
            id: '1',
            isRecurring: true,
            recurrencePeriod: 'monthly',
            recurrenceInterval: 1
          }
        },
        global: { stubs }
      });
      expect(recurring.find('.btn-danger').exists()).toBe(true);
    });
  });

  describe('form defaults', () => {
    it('defaults to monthly period with interval 1', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      const select = wrapper.find('select');
      expect(select.element.value).toBe('monthly');

      const intervalInput = wrapper.find('input[type="number"]');
      expect(intervalInput.element.value).toBe('1');
    });

    it('pre-fills form when editing recurring transaction', async () => {
      const transaction = {
        id: '1',
        isRecurring: true,
        recurrencePeriod: 'weekly',
        recurrenceInterval: 3,
        recurrenceEndsAt: '2026-06-15T00:00:00.000Z'
      };

      const wrapper = mount(RecurringModal, {
        props: { isOpen: false, transaction },
        global: { stubs }
      });

      await wrapper.setProps({ isOpen: true });
      await wrapper.vm.$nextTick();

      const select = wrapper.find('select');
      expect(select.element.value).toBe('weekly');

      const intervalInput = wrapper.find('input[type="number"]');
      expect(intervalInput.element.value).toBe('3');
    });
  });

  describe('events', () => {
    it('emits save with config on form submit', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      await wrapper.find('form').trigger('submit');

      expect(wrapper.emitted('save')).toBeTruthy();
      const config = wrapper.emitted('save')?.[0]?.[0];
      expect(config.is_recurring).toBe(true);
      expect(config.recurrence_period).toBe('monthly');
      expect(config.recurrence_interval).toBe(1);
    });

    it('emits cancel when cancel button clicked', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      await wrapper.find('.btn-secondary').trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits cancel when overlay clicked', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      await wrapper.find('.modal-overlay').trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits cancel when close button clicked', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      await wrapper.find('.close-button').trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits remove when remove button clicked', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: {
            id: '1',
            isRecurring: true,
            recurrencePeriod: 'monthly',
            recurrenceInterval: 1
          }
        },
        global: { stubs }
      });

      await wrapper.find('.btn-danger').trigger('click');
      expect(wrapper.emitted('remove')).toBeTruthy();
    });

    it('emits save with updated values after user changes', async () => {
      const wrapper = mount(RecurringModal, {
        props: {
          isOpen: true,
          transaction: { id: '1', isRecurring: false }
        },
        global: { stubs }
      });

      await wrapper.find('select').setValue('weekly');
      await wrapper.find('input[type="number"]').setValue('2');
      await wrapper.find('form').trigger('submit');

      const config = wrapper.emitted('save')?.[0]?.[0];
      expect(config.recurrence_period).toBe('weekly');
      expect(config.recurrence_interval).toBe(2);
    });
  });
});
