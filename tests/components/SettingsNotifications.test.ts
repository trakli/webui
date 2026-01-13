import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SettingsNotifications from '@/components/settings/SettingsNotifications.vue';

const mockGetPreferences = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock('@/services/api', () => ({
  notificationsApi: {
    getPreferences: () => mockGetPreferences(),
    updatePreferences: (prefs: unknown) => mockUpdatePreferences(prefs)
  }
}));

const stubs = {
  Save: { template: '<span class="save-icon" />' },
  Mail: { template: '<span class="mail-icon" />' },
  Smartphone: { template: '<span class="smartphone-icon" />' },
  Bell: { template: '<span class="bell-icon" />' },
  Clock: { template: '<span class="clock-icon" />' },
  TrendingUp: { template: '<span class="trending-icon" />' },
  UserCheck: { template: '<span class="usercheck-icon" />' }
};

describe('SettingsNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPreferences.mockResolvedValue({
      channels: { email: true, push: true, inapp: true },
      types: { reminders: true, insights: true, inactivity: true }
    });
  });

  describe('loading state', () => {
    it('shows loading state initially', () => {
      mockGetPreferences.mockImplementation(() => new Promise(() => {}));

      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      expect(wrapper.find('.loading-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('Loading preferences...');
    });

    it('hides loading state after preferences load', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.loading-state').exists()).toBe(false);
    });
  });

  describe('channel toggles', () => {
    it('renders email toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('Email Notifications');
    });

    it('renders push toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('Push Notifications');
    });

    it('renders inapp toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('In-App Notifications');
    });
  });

  describe('type toggles', () => {
    it('renders reminders toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('Reminders');
    });

    it('renders insights toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('Financial Insights');
    });

    it('renders inactivity toggle', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.text()).toContain('Engagement Reminders');
    });
  });

  describe('edit mode', () => {
    it('toggles are disabled when isEditMode is false', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.attributes('disabled')).toBeDefined();
      });
    });

    it('toggles are enabled when isEditMode is true', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: true },
        global: { stubs }
      });

      await flushPromises();

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.attributes('disabled')).toBeUndefined();
      });
    });

    it('shows save button when isEditMode is true', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: true },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.submit-btn').exists()).toBe(true);
      expect(wrapper.text()).toContain('Save Preferences');
    });

    it('hides save button when isEditMode is false', async () => {
      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.submit-btn').exists()).toBe(false);
    });
  });

  describe('save functionality', () => {
    it('calls updatePreferences on save', async () => {
      mockUpdatePreferences.mockResolvedValue({
        channels: { email: true, push: true, inapp: true },
        types: { reminders: true, insights: true, inactivity: true }
      });

      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: true },
        global: { stubs }
      });

      await flushPromises();

      await wrapper.find('.submit-btn').trigger('click');
      await flushPromises();

      expect(mockUpdatePreferences).toHaveBeenCalled();
    });

    it('shows success message after save', async () => {
      mockUpdatePreferences.mockResolvedValue({});

      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: true },
        global: { stubs }
      });

      await flushPromises();

      await wrapper.find('.submit-btn').trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Notification preferences updated!');
    });
  });

  describe('preferences loading', () => {
    it('loads preferences on mount', async () => {
      mount(SettingsNotifications, {
        props: { isEditMode: false },
        global: { stubs }
      });

      await flushPromises();

      expect(mockGetPreferences).toHaveBeenCalled();
    });

    it('populates toggles with loaded preferences', async () => {
      mockGetPreferences.mockResolvedValue({
        channels: { email: false, push: true, inapp: false },
        types: { reminders: false, insights: true, inactivity: false }
      });

      const wrapper = mount(SettingsNotifications, {
        props: { isEditMode: true },
        global: { stubs }
      });

      await flushPromises();

      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect((checkboxes[0].element as HTMLInputElement).checked).toBe(false);
      expect((checkboxes[1].element as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[2].element as HTMLInputElement).checked).toBe(false);
    });
  });
});
