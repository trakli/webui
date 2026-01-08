import { describe, it, expect, vi, beforeEach } from 'vitest';
import { remindersApi } from '@/services/api/remindersApi';

const mockApi = vi.fn();
vi.mock('#imports', () => ({
  useApi: () => mockApi
}));

vi.stubGlobal('useApi', () => mockApi);

describe('remindersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('should call /reminders endpoint', async () => {
      const mockResponse = {
        data: {
          last_sync: '2024-01-01T00:00:00Z',
          data: [{ id: 1, title: 'Test Reminder' }]
        }
      };
      mockApi.mockResolvedValueOnce(mockResponse);

      await remindersApi.fetchAll();

      expect(mockApi).toHaveBeenCalledWith('/reminders');
    });

    it('should return data array from response', async () => {
      const mockReminders = [
        { id: 1, title: 'Reminder 1' },
        { id: 2, title: 'Reminder 2' }
      ];
      mockApi.mockResolvedValueOnce({
        data: { last_sync: '2024-01-01T00:00:00Z', data: mockReminders }
      });

      const result = await remindersApi.fetchAll();

      expect(result.data).toEqual(mockReminders);
    });
  });

  describe('fetch', () => {
    it('should call /reminders/{id} endpoint', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, title: 'Test' } });

      await remindersApi.fetch(1);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1');
    });

    it('should return reminder data', async () => {
      const mockReminder = { id: 1, title: 'Test Reminder', type: 'custom' };
      mockApi.mockResolvedValueOnce({ data: mockReminder });

      const result = await remindersApi.fetch(1);

      expect(result).toEqual(mockReminder);
    });

    it('should throw on error', async () => {
      mockApi.mockRejectedValueOnce(new Error('Not found'));

      await expect(remindersApi.fetch(999)).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should POST to /reminders with body', async () => {
      const payload = {
        title: 'New Reminder',
        type: 'custom',
        trigger_at: '2024-12-01T10:00:00Z'
      };
      mockApi.mockResolvedValueOnce({ data: { id: 1, ...payload } });

      await remindersApi.create(payload);

      expect(mockApi).toHaveBeenCalledWith('/reminders', {
        method: 'POST',
        body: payload
      });
    });

    it('should return created reminder', async () => {
      const payload = { title: 'New', type: 'custom', trigger_at: '2024-12-01T10:00:00Z' };
      const created = { id: 1, ...payload, status: 'active' };
      mockApi.mockResolvedValueOnce({ data: created });

      const result = await remindersApi.create(payload);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should PUT to /reminders/{id} with body', async () => {
      const payload = { title: 'Updated Reminder' };
      mockApi.mockResolvedValueOnce({ data: { id: 1, ...payload } });

      await remindersApi.update(1, payload);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1', {
        method: 'PUT',
        body: payload
      });
    });

    it('should return updated reminder', async () => {
      const updated = { id: 1, title: 'Updated', status: 'active' };
      mockApi.mockResolvedValueOnce({ data: updated });

      const result = await remindersApi.update(1, { title: 'Updated' });

      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should DELETE /reminders/{id}', async () => {
      mockApi.mockResolvedValueOnce({});

      await remindersApi.delete(1);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1', {
        method: 'DELETE'
      });
    });

    it('should return true on success', async () => {
      mockApi.mockResolvedValueOnce({});

      const result = await remindersApi.delete(1);

      expect(result).toBe(true);
    });
  });

  describe('snooze', () => {
    it('should POST to /reminders/{id}/snooze with duration', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, status: 'snoozed' } });

      await remindersApi.snooze(1, 30);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1/snooze', {
        method: 'POST',
        body: { duration: 30 }
      });
    });

    it('should return snoozed reminder', async () => {
      const snoozed = { id: 1, status: 'snoozed' };
      mockApi.mockResolvedValueOnce({ data: snoozed });

      const result = await remindersApi.snooze(1, 30);

      expect(result).toEqual(snoozed);
    });
  });

  describe('pause', () => {
    it('should POST to /reminders/{id}/pause', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, status: 'paused' } });

      await remindersApi.pause(1);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1/pause', {
        method: 'POST'
      });
    });

    it('should return paused reminder', async () => {
      const paused = { id: 1, status: 'paused' };
      mockApi.mockResolvedValueOnce({ data: paused });

      const result = await remindersApi.pause(1);

      expect(result).toEqual(paused);
    });
  });

  describe('resume', () => {
    it('should POST to /reminders/{id}/resume', async () => {
      mockApi.mockResolvedValueOnce({ data: { id: 1, status: 'active' } });

      await remindersApi.resume(1);

      expect(mockApi).toHaveBeenCalledWith('/reminders/1/resume', {
        method: 'POST'
      });
    });

    it('should return resumed reminder', async () => {
      const resumed = { id: 1, status: 'active' };
      mockApi.mockResolvedValueOnce({ data: resumed });

      const result = await remindersApi.resume(1);

      expect(result).toEqual(resumed);
    });
  });
});
