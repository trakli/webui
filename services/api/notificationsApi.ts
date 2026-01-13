import type {
  Notification,
  NotificationsResponse,
  NotificationPreferences,
  ApiResponse
} from '~/types/notification';

const notificationsApi = {
  async fetchAll(params?: {
    unread_only?: boolean;
    limit?: number;
  }): Promise<NotificationsResponse> {
    const api = useApi();
    const queryParams = new URLSearchParams();

    if (params?.unread_only) {
      queryParams.append('unread_only', 'true');
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api<ApiResponse<NotificationsResponse>>(url);

    return response?.data || { data: [], unread_count: 0 };
  },

  async fetch(id: number): Promise<Notification | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Notification>>(`/notifications/${id}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  async getUnreadCount(): Promise<number> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return response?.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async markAsRead(id: number): Promise<Notification | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Notification>>(`/notifications/${id}/read`, {
        method: 'POST'
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    const api = useApi();
    try {
      await api('/notifications/read-all', {
        method: 'POST'
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/notifications/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async getPreferences(): Promise<NotificationPreferences | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<NotificationPreferences>>(
        '/notifications/preferences'
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<NotificationPreferences>>(
        '/notifications/preferences',
        {
          method: 'PUT',
          body: preferences
        }
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
};

export default notificationsApi;
export { notificationsApi };
