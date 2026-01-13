import type {
  Reminder,
  ReminderCreatePayload,
  ReminderUpdatePayload,
  ReminderSnoozePayload,
  RemindersResponse,
  ApiResponse
} from '~/types/reminder';
import { extractResponseData } from './apiHelpers';

const remindersApi = {
  async fetchAll(): Promise<RemindersResponse> {
    const api = useApi();
    const response = await api<ApiResponse<RemindersResponse>>('/reminders');

    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  async fetch(id: number): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>(`/reminders/${id}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching reminder:', error);
      throw error;
    }
  },

  async create(data: ReminderCreatePayload): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>('/reminders', {
        method: 'POST',
        body: data
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  async update(id: number, data: ReminderUpdatePayload): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>(`/reminders/${id}`, {
        method: 'PUT',
        body: data
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/reminders/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  async snooze(id: number, duration: number): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>(`/reminders/${id}/snooze`, {
        method: 'POST',
        body: { duration } as ReminderSnoozePayload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      throw error;
    }
  },

  async pause(id: number): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>(`/reminders/${id}/pause`, {
        method: 'POST'
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error pausing reminder:', error);
      throw error;
    }
  },

  async resume(id: number): Promise<Reminder | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Reminder>>(`/reminders/${id}/resume`, {
        method: 'POST'
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error resuming reminder:', error);
      throw error;
    }
  }
};

export default remindersApi;
export { remindersApi };
