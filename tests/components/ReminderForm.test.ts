import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReminderForm from '@/components/reminders/ReminderForm.vue';

const stubs = {
  X: { template: '<span class="x-icon" />' },
  Loader2: { template: '<span class="loader-icon" />' }
};

describe('ReminderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders form container', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('.reminder-form').exists()).toBe(true);
    });

    it('renders title field', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    });

    it('renders description textarea', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('renders type select', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      const selects = wrapper.findAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('renders datetime-local input', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true);
    });

    it('renders close button', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('.close-btn').exists()).toBe(true);
    });
  });

  describe('create mode', () => {
    it('shows "Create Reminder" title when not editing', () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem: null },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Create Reminder');
    });

    it('shows "Create Reminder" button text when not editing', () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem: null },
        global: { stubs }
      });

      expect(wrapper.find('.btn-primary').text()).toContain('Create Reminder');
    });
  });

  describe('edit mode', () => {
    const editingItem = {
      id: 1,
      title: 'Test Reminder',
      description: 'Test description',
      type: 'bill_due',
      trigger_at: '2024-12-01T10:00:00Z',
      timezone: 'America/New_York',
      priority: 1,
      repeat_rule: 'FREQ=WEEKLY'
    };

    it('shows "Edit Reminder" title when editing', () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Edit Reminder');
    });

    it('shows "Update Reminder" button text when editing', () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem },
        global: { stubs }
      });

      expect(wrapper.find('.btn-primary').text()).toContain('Update Reminder');
    });

    it('populates title field when editing', async () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem },
        global: { stubs }
      });

      await flushPromises();

      const input = wrapper.find('input[type="text"]');
      expect((input.element as HTMLInputElement).value).toBe('Test Reminder');
    });

    it('populates description field when editing', async () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem },
        global: { stubs }
      });

      await flushPromises();

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe('Test description');
    });
  });

  describe('events', () => {
    it('emits close when close button clicked', async () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      await wrapper.find('.close-btn').trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits close when cancel button clicked', async () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      await wrapper.find('.btn-secondary').trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits created when form submitted in create mode', async () => {
      const wrapper = mount(ReminderForm, {
        props: { editingItem: null },
        global: { stubs }
      });

      await wrapper.find('input[type="text"]').setValue('New Reminder');
      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('created')).toBeTruthy();
    });

    it('emits updated with id when form submitted in edit mode', async () => {
      const editingItem = {
        id: 123,
        title: 'Test',
        type: 'custom',
        trigger_at: '2024-12-01T10:00:00Z'
      };

      const wrapper = mount(ReminderForm, {
        props: { editingItem },
        global: { stubs }
      });

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.emitted('updated')).toBeTruthy();
      expect(wrapper.emitted('updated')![0][0]).toHaveProperty('id', 123);
    });
  });

  describe('form fields', () => {
    it('has required attribute on title field', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      const input = wrapper.find('input[type="text"]');
      expect(input.attributes('required')).toBeDefined();
    });

    it('has required attribute on datetime field', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      const input = wrapper.find('input[type="datetime-local"]');
      expect(input.attributes('required')).toBeDefined();
    });

    it('renders repeat options', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Does not repeat');
      expect(wrapper.text()).toContain('Daily');
      expect(wrapper.text()).toContain('Weekly');
      expect(wrapper.text()).toContain('Monthly');
    });

    it('renders priority options', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Normal');
      expect(wrapper.text()).toContain('High');
      expect(wrapper.text()).toContain('Urgent');
    });

    it('renders type options', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Daily Tracking');
      expect(wrapper.text()).toContain('Weekly Review');
      expect(wrapper.text()).toContain('Bill Due');
      expect(wrapper.text()).toContain('Custom');
    });
  });

  describe('loading state', () => {
    it('has submit button', () => {
      const wrapper = mount(ReminderForm, {
        global: { stubs }
      });

      expect(wrapper.find('.btn-primary').exists()).toBe(true);
      expect(wrapper.find('.btn-primary').text()).toContain('Create Reminder');
    });
  });
});
