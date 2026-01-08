import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import NotificationBell from '@/components/NotificationBell.vue';

const mockFetchAll = vi.fn();
const mockGetUnreadCount = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock('@/services/api', () => ({
  notificationsApi: {
    fetchAll: () => mockFetchAll(),
    getUnreadCount: () => mockGetUnreadCount(),
    markAsRead: (id: number) => mockMarkAsRead(id),
    markAllAsRead: () => mockMarkAllAsRead()
  }
}));

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to']
  },
  Bell: { template: '<span class="bell-stub" />' },
  BellOff: { template: '<span class="belloff-stub" />' },
  Check: { template: '<span class="check-stub" />' },
  Clock: { template: '<span class="clock-stub" />' },
  TrendingUp: { template: '<span class="trending-stub" />' },
  AlertCircle: { template: '<span class="alert-stub" />' },
  Award: { template: '<span class="award-stub" />' }
};

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnreadCount.mockResolvedValue(0);
    mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });
  });

  describe('rendering', () => {
    it('renders bell button', async () => {
      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.bell-button').exists()).toBe(true);
    });

    it('renders bell icon', async () => {
      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.bell-icon').exists()).toBe(true);
    });
  });

  describe('unread badge', () => {
    it('shows badge when unreadCount > 0', async () => {
      mockGetUnreadCount.mockResolvedValue(5);

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.badge').exists()).toBe(true);
      expect(wrapper.find('.badge').text()).toBe('5');
    });

    it('hides badge when unreadCount is 0', async () => {
      mockGetUnreadCount.mockResolvedValue(0);

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.badge').exists()).toBe(false);
    });

    it('shows "99+" when count exceeds 99', async () => {
      mockGetUnreadCount.mockResolvedValue(150);

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.badge').text()).toBe('99+');
    });
  });

  describe('dropdown', () => {
    it('dropdown is hidden by default', async () => {
      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
    });

    it('opens dropdown on click', async () => {
      mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('.notification-dropdown').exists()).toBe(true);
    });

    it('fetches notifications when dropdown opens', async () => {
      mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(mockFetchAll).toHaveBeenCalled();
    });

    it('closes dropdown when bell clicked again', async () => {
      mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('.notification-dropdown').exists()).toBe(true);

      await wrapper.find('.bell-button').trigger('click');

      expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('shows empty state when no notifications', async () => {
      mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('.dropdown-empty').exists()).toBe(true);
      expect(wrapper.text()).toContain('No notifications yet');
    });
  });

  describe('notification list', () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Test Notification',
        body: 'This is a test',
        type: 'reminder',
        read_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Another Notification',
        body: 'Another test',
        type: 'system',
        read_at: '2024-01-01T00:00:00Z',
        created_at: new Date().toISOString()
      }
    ];

    it('renders notification items', async () => {
      mockFetchAll.mockResolvedValue({ data: mockNotifications, unread_count: 1 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      const items = wrapper.findAll('.notification-item');
      expect(items.length).toBe(2);
    });

    it('applies unread class to unread notifications', async () => {
      mockFetchAll.mockResolvedValue({ data: mockNotifications, unread_count: 1 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      const items = wrapper.findAll('.notification-item');
      expect(items[0].classes()).toContain('unread');
      expect(items[1].classes()).not.toContain('unread');
    });

    it('shows notification title', async () => {
      mockFetchAll.mockResolvedValue({ data: mockNotifications, unread_count: 1 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.text()).toContain('Test Notification');
    });
  });

  describe('mark as read', () => {
    it('calls markAsRead when mark read button clicked', async () => {
      const notification = {
        id: 1,
        title: 'Test',
        body: 'Test body',
        type: 'reminder',
        read_at: null,
        created_at: new Date().toISOString()
      };
      mockFetchAll.mockResolvedValue({ data: [notification], unread_count: 1 });
      mockMarkAsRead.mockResolvedValue({});

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      await wrapper.find('.mark-read-btn').trigger('click');
      await flushPromises();

      expect(mockMarkAsRead).toHaveBeenCalledWith(1);
    });
  });

  describe('mark all as read', () => {
    it('shows mark all read button when notifications exist', async () => {
      const notification = {
        id: 1,
        title: 'Test',
        body: 'Test',
        type: 'reminder',
        read_at: null,
        created_at: new Date().toISOString()
      };
      mockFetchAll.mockResolvedValue({ data: [notification], unread_count: 1 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('.mark-all-btn').exists()).toBe(true);
    });

    it('calls markAllAsRead when clicked', async () => {
      const notification = {
        id: 1,
        title: 'Test',
        body: 'Test',
        type: 'reminder',
        read_at: null,
        created_at: new Date().toISOString()
      };
      mockFetchAll.mockResolvedValue({ data: [notification], unread_count: 1 });
      mockMarkAllAsRead.mockResolvedValue(true);

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      await wrapper.find('.mark-all-btn').trigger('click');
      await flushPromises();

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe('view all link', () => {
    it('renders view all notifications link', async () => {
      mockFetchAll.mockResolvedValue({ data: [], unread_count: 0 });

      const wrapper = mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();
      await wrapper.find('.bell-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('.view-all-link').exists()).toBe(true);
      expect(wrapper.text()).toContain('View all notifications');
    });
  });

  describe('initialization', () => {
    it('fetches unread count on mount', async () => {
      mount(NotificationBell, {
        global: { stubs }
      });

      await flushPromises();

      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });
});
