import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import RemindersPage from '@/pages/reminders.vue';

const mockReminders = ref([]);
const mockIsLoading = ref(false);
const mockError = ref(null);
const mockFetchReminders = vi.fn();
const mockCreateReminder = vi.fn();
const mockUpdateReminder = vi.fn();
const mockDeleteReminder = vi.fn();
const mockPauseReminder = vi.fn();
const mockResumeReminder = vi.fn();

vi.mock('@/composables/useReminders', () => ({
  useReminders: () => ({
    reminders: mockReminders,
    isLoading: mockIsLoading,
    error: mockError,
    fetchReminders: mockFetchReminders,
    createReminder: mockCreateReminder,
    updateReminder: mockUpdateReminder,
    deleteReminder: mockDeleteReminder,
    pauseReminder: mockPauseReminder,
    resumeReminder: mockResumeReminder
  })
}));

const mockConfirmDelete = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    confirmDelete: mockConfirmDelete,
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}));

vi.stubGlobal('definePageMeta', vi.fn());

const stubs = {
  ReminderForm: {
    template: '<div class="reminder-form-stub"><slot /></div>',
    props: ['editingItem'],
    emits: ['created', 'updated', 'close']
  },
  Bell: { template: '<span class="bell-stub" />' },
  Plus: { template: '<span class="plus-stub" />' },
  Clock: { template: '<span class="clock-stub" />' },
  Calendar: { template: '<span class="calendar-stub" />' },
  Repeat: { template: '<span class="repeat-stub" />' },
  Pause: { template: '<span class="pause-stub" />' },
  Play: { template: '<span class="play-stub" />' },
  Pencil: { template: '<span class="pencil-stub" />' },
  Trash2: { template: '<span class="trash-stub" />' },
  Loader2: { template: '<span class="loader-stub" />' },
  AlertCircle: { template: '<span class="alert-stub" />' },
  TrendingUp: { template: '<span class="trending-stub" />' },
  Receipt: { template: '<span class="receipt-stub" />' },
  PiggyBank: { template: '<span class="piggy-stub" />' },
  Star: { template: '<span class="star-stub" />' }
};

describe('RemindersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReminders.value = [];
    mockIsLoading.value = false;
    mockError.value = null;
    mockFetchReminders.mockResolvedValue(undefined);
    mockConfirmDelete.mockResolvedValue(true);
  });

  describe('header', () => {
    it('renders page title', () => {
      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Reminders');
    });

    it('renders add reminder button', () => {
      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.find('.add-btn').exists()).toBe(true);
      expect(wrapper.text()).toContain('Add Reminder');
    });
  });

  describe('loading state', () => {
    it('shows loading state when isLoading is true', () => {
      mockIsLoading.value = true;

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.find('.loading-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('Loading reminders...');
    });
  });

  describe('error state', () => {
    it('shows error state when error exists', () => {
      mockError.value = 'Failed to load reminders';

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.find('.error-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('Failed to load reminders');
    });
  });

  describe('empty state', () => {
    it('shows empty state when no reminders', () => {
      mockReminders.value = [];

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('No reminders yet');
    });

    it('shows create first reminder button in empty state', () => {
      mockReminders.value = [];

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Create your first reminder');
    });
  });

  describe('reminders list', () => {
    const sampleReminders = [
      {
        id: 1,
        title: 'Weekly Review',
        description: 'Review expenses',
        type: 'weekly_review',
        status: 'active',
        trigger_at: '2024-12-01T10:00:00Z',
        repeat_rule: 'FREQ=WEEKLY'
      },
      {
        id: 2,
        title: 'Pay Bills',
        type: 'bill_due',
        status: 'paused',
        trigger_at: '2024-12-15T09:00:00Z'
      }
    ];

    it('renders reminder cards when reminders exist', () => {
      mockReminders.value = sampleReminders;

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const cards = wrapper.findAll('.reminder-card');
      expect(cards.length).toBe(2);
    });

    it('displays reminder title', () => {
      mockReminders.value = sampleReminders;

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Weekly Review');
      expect(wrapper.text()).toContain('Pay Bills');
    });

    it('displays reminder description when present', () => {
      mockReminders.value = sampleReminders;

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Review expenses');
    });

    it('applies is-paused class to paused reminders', () => {
      mockReminders.value = sampleReminders;

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const cards = wrapper.findAll('.reminder-card');
      expect(cards[0].classes()).not.toContain('is-paused');
      expect(cards[1].classes()).toContain('is-paused');
    });
  });

  describe('actions', () => {
    const activeReminder = {
      id: 1,
      title: 'Test',
      type: 'custom',
      status: 'active',
      trigger_at: '2024-12-01T10:00:00Z'
    };

    const pausedReminder = {
      id: 2,
      title: 'Paused',
      type: 'custom',
      status: 'paused',
      trigger_at: '2024-12-01T10:00:00Z'
    };

    it('shows pause button for active reminders', () => {
      mockReminders.value = [activeReminder];

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const cards = wrapper.findAll('.reminder-card');
      expect(cards.length).toBe(1);
      const actionBtns = cards[0].findAll('.action-btn');
      expect(actionBtns.length).toBeGreaterThanOrEqual(2);
    });

    it('shows play button for paused reminders', () => {
      mockReminders.value = [pausedReminder];

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const cards = wrapper.findAll('.reminder-card');
      expect(cards.length).toBe(1);
      const actionBtns = cards[0].findAll('.action-btn');
      expect(actionBtns.length).toBeGreaterThanOrEqual(2);
    });

    it('calls pauseReminder when pause clicked', async () => {
      mockReminders.value = [activeReminder];
      mockPauseReminder.mockResolvedValue({ ...activeReminder, status: 'paused' });

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const pauseBtn = wrapper.findAll('.action-btn')[0];
      await pauseBtn.trigger('click');
      await flushPromises();

      expect(mockPauseReminder).toHaveBeenCalledWith(1);
    });

    it('calls resumeReminder when resume clicked', async () => {
      mockReminders.value = [pausedReminder];
      mockResumeReminder.mockResolvedValue({ ...pausedReminder, status: 'active' });

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const resumeBtn = wrapper.findAll('.action-btn')[0];
      await resumeBtn.trigger('click');
      await flushPromises();

      expect(mockResumeReminder).toHaveBeenCalledWith(2);
    });

    it('shows confirmation before delete', async () => {
      mockReminders.value = [activeReminder];
      mockConfirmDelete.mockResolvedValue(false);

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const deleteBtn = wrapper.find('.action-btn--danger');
      await deleteBtn.trigger('click');
      await flushPromises();

      expect(mockConfirmDelete).toHaveBeenCalledWith('reminder');
    });

    it('calls deleteReminder when confirmed', async () => {
      mockReminders.value = [activeReminder];
      mockConfirmDelete.mockResolvedValue(true);
      mockDeleteReminder.mockResolvedValue(true);

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const deleteBtn = wrapper.find('.action-btn--danger');
      await deleteBtn.trigger('click');
      await flushPromises();

      expect(mockDeleteReminder).toHaveBeenCalledWith(1);
    });

    it('does not delete when confirmation cancelled', async () => {
      mockReminders.value = [activeReminder];
      mockConfirmDelete.mockResolvedValue(false);

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const deleteBtn = wrapper.find('.action-btn--danger');
      await deleteBtn.trigger('click');
      await flushPromises();

      expect(mockDeleteReminder).not.toHaveBeenCalled();
    });
  });

  describe('form', () => {
    it('shows form when add button clicked', async () => {
      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      await wrapper.find('.add-btn').trigger('click');

      expect(wrapper.find('.reminder-form-stub').exists()).toBe(true);
    });

    it('hides reminders list when form is shown', async () => {
      mockReminders.value = [
        { id: 1, title: 'Test', type: 'custom', status: 'active', trigger_at: '2024-12-01' }
      ];

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      expect(wrapper.find('.reminders-list').exists()).toBe(true);

      await wrapper.find('.add-btn').trigger('click');

      expect(wrapper.find('.reminders-list').exists()).toBe(false);
    });
  });

  describe('data fetching', () => {
    it('fetches reminders on mount', async () => {
      mount(RemindersPage, {
        global: { stubs }
      });

      await flushPromises();

      expect(mockFetchReminders).toHaveBeenCalled();
    });
  });

  describe('notifications', () => {
    it('shows success notification after pause', async () => {
      mockReminders.value = [
        { id: 1, title: 'Test', type: 'custom', status: 'active', trigger_at: '2024-12-01' }
      ];
      mockPauseReminder.mockResolvedValue({});

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const pauseBtn = wrapper.findAll('.action-btn')[0];
      await pauseBtn.trigger('click');
      await flushPromises();

      expect(mockShowSuccess).toHaveBeenCalled();
    });

    it('shows error notification on pause failure', async () => {
      mockReminders.value = [
        { id: 1, title: 'Test', type: 'custom', status: 'active', trigger_at: '2024-12-01' }
      ];
      mockPauseReminder.mockRejectedValue(new Error('Failed'));

      const wrapper = mount(RemindersPage, {
        global: { stubs }
      });

      const pauseBtn = wrapper.findAll('.action-btn')[0];
      await pauseBtn.trigger('click');
      await flushPromises();

      expect(mockShowError).toHaveBeenCalled();
    });
  });
});
