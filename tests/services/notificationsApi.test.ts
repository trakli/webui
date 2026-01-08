import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsApi } from '@/services/api/notificationsApi';

const mockApi = vi.fn();
vi.mock('#imports', () => ({
  useApi: () => mockApi
}));

vi.stubGlobal('useApi', () => mockApi);

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should call /notifications endpoint without params', async () => {
      mockApi.mockResolvedValueOnce({ data: { data: [], unread_count: 0 } });

      await notificationsApi.fetchAll();

      expect(mockApi).toHaveBeenCalledWith('/notifications');
    });

    it('should add query params when provided', async () => {
      mockApi.mockResolvedValueOnce({ data: { data: [], unread_count: 0 } });

      await notificationsApi.fetchAll({ unread_only: true, limit: 10 });

      expect(mockApi).toHaveBeenCalledWith('/notifications?unread_only=true&limit=10');
    });

    it('should return notifications data', async () => {
      const mockData = {
        data: [{ id: 1, title: 'Test' }],
        unread_count: 5
      };
      mockApi.mockResolvedValueOnce({ data: mockData });

      const result = await notificationsApi.fetchAll();

      expect(result).toEqual(mockData);
    });
  });

  describe('fetch', () => {
    it('should call /notifications/{id} endpoint', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, title: 'Test' } });

      await notificationsApi.fetch(1);

      expect(mockApi).toHaveBeenCalledWith('/notifications/1');
    });

    it('should return notification data', async () => {
      const notification = { id: 1, title: 'Test Notification', body: 'Content' };
      mockApi.mockResolvedValueOnce({ data: notification });

      const result = await notificationsApi.fetch(1);

      expect(result).toEqual(notification);
    });

    it('should throw on error', async () => {
      mockApi.mockRejectedValueOnce(new Error('Not found'));

      await expect(notificationsApi.fetch(999)).rejects.toThrow('Not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should call /notifications/unread-count endpoint', async () => {
      mockApi.mockResolvedValueOnce({ data: { count: 5 } });

      await notificationsApi.getUnreadCount();

      expect(mockApi).toHaveBeenCalledWith('/notifications/unread-count');
    });

    it('should return count number', async () => {
      mockApi.mockResolvedValueOnce({ data: { count: 10 } });

      const result = await notificationsApi.getUnreadCount();

      expect(result).toBe(10);
    });

    it('should return 0 on error', async () => {
      mockApi.mockRejectedValueOnce(new Error('Server error'));

      const result = await notificationsApi.getUnreadCount();

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should POST to /notifications/{id}/read', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, read_at: '2024-01-01' } });

      await notificationsApi.markAsRead(1);

      expect(mockApi).toHaveBeenCalledWith('/notifications/1/read', {
        method: 'POST'
      });
    });

    it('should return updated notification', async () => {
      const updated = { id: 1, read_at: '2024-01-01T00:00:00Z' };
      mockApi.mockResolvedValueOnce({ data: updated });

      const result = await notificationsApi.markAsRead(1);

      expect(result).toEqual(updated);
    });
  });

  describe('markAllAsRead', () => {
    it('should POST to /notifications/read-all', async () => {
      mockApi.mockResolvedValueOnce({});

      await notificationsApi.markAllAsRead();

      expect(mockApi).toHaveBeenCalledWith('/notifications/read-all', {
        method: 'POST'
      });
    });

    it('should return true on success', async () => {
      mockApi.mockResolvedValueOnce({});

      const result = await notificationsApi.markAllAsRead();

      expect(result).toBe(true);
    });
  });

  describe('delete', () => {
    it('should DELETE /notifications/{id}', async () => {
      mockApi.mockResolvedValueOnce({});

      await notificationsApi.delete(1);

      expect(mockApi).toHaveBeenCalledWith('/notifications/1', {
        method: 'DELETE'
      });
    });

    it('should return true on success', async () => {
      mockApi.mockResolvedValueOnce({});

      const result = await notificationsApi.delete(1);

      expect(result).toBe(true);
    });
  });

  describe('getPreferences', () => {
    it('should call /notifications/preferences endpoint', async () => {
      mockApi.mockResolvedValueOnce({
        data: {
          channels: { email: true, push: true, inapp: true },
          types: { reminders: true, insights: true, inactivity: true }
        }
      });

      await notificationsApi.getPreferences();

      expect(mockApi).toHaveBeenCalledWith('/notifications/preferences');
    });

    it('should return preferences data', async () => {
      const prefs = {
        channels: { email: true, push: false, inapp: true },
        types: { reminders: true, insights: false, inactivity: true }
      };
      mockApi.mockResolvedValueOnce({ data: prefs });

      const result = await notificationsApi.getPreferences();

      expect(result).toEqual(prefs);
    });

    it('should return null on error', async () => {
      mockApi.mockRejectedValueOnce(new Error('Server error'));

      const result = await notificationsApi.getPreferences();

      expect(result).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('should PUT to /notifications/preferences with body', async () => {
      const prefs = { channels: { email: false } };
      mockApi.mockResolvedValueOnce({ data: prefs });

      await notificationsApi.updatePreferences(prefs);

      expect(mockApi).toHaveBeenCalledWith('/notifications/preferences', {
        method: 'PUT',
        body: prefs
      });
    });

    it('should return updated preferences', async () => {
      const prefs = {
        channels: { email: false, push: true, inapp: true },
        types: { reminders: true, insights: true, inactivity: false }
      };
      mockApi.mockResolvedValueOnce({ data: prefs });

      const result = await notificationsApi.updatePreferences(prefs);

      expect(result).toEqual(prefs);
    });

    it('should throw on error', async () => {
      mockApi.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        notificationsApi.updatePreferences({ channels: { email: false } })
      ).rejects.toThrow('Update failed');
    });
  });
});
