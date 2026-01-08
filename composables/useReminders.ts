import { ref } from 'vue';
import type { Reminder, ReminderCreatePayload, ReminderUpdatePayload } from '~/types/reminder';
import { remindersApi } from '~/services/api';

const reminders = ref<Reminder[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useReminders() {
  async function fetchReminders() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await remindersApi.fetchAll();
      reminders.value = response.data || [];
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch reminders';
      console.error('Failed to fetch reminders:', e);
    } finally {
      isLoading.value = false;
    }
  }

  async function createReminder(data: ReminderCreatePayload): Promise<Reminder | null> {
    try {
      const reminder = await remindersApi.create(data);
      if (reminder) {
        reminders.value.unshift(reminder);
      }
      return reminder;
    } catch (e: any) {
      error.value = e.message || 'Failed to create reminder';
      throw e;
    }
  }

  async function updateReminder(id: number, data: ReminderUpdatePayload): Promise<Reminder | null> {
    try {
      const reminder = await remindersApi.update(id, data);
      if (reminder) {
        const index = reminders.value.findIndex((r) => r.id === id);
        if (index !== -1) {
          reminders.value[index] = reminder;
        }
      }
      return reminder;
    } catch (e: any) {
      error.value = e.message || 'Failed to update reminder';
      throw e;
    }
  }

  async function deleteReminder(id: number): Promise<boolean> {
    try {
      await remindersApi.delete(id);
      reminders.value = reminders.value.filter((r) => r.id !== id);
      return true;
    } catch (e: any) {
      error.value = e.message || 'Failed to delete reminder';
      throw e;
    }
  }

  async function snoozeReminder(id: number, duration: number): Promise<Reminder | null> {
    try {
      const reminder = await remindersApi.snooze(id, duration);
      if (reminder) {
        const index = reminders.value.findIndex((r) => r.id === id);
        if (index !== -1) {
          reminders.value[index] = reminder;
        }
      }
      return reminder;
    } catch (e: any) {
      error.value = e.message || 'Failed to snooze reminder';
      throw e;
    }
  }

  async function pauseReminder(id: number): Promise<Reminder | null> {
    try {
      const reminder = await remindersApi.pause(id);
      if (reminder) {
        const index = reminders.value.findIndex((r) => r.id === id);
        if (index !== -1) {
          reminders.value[index] = reminder;
        }
      }
      return reminder;
    } catch (e: any) {
      error.value = e.message || 'Failed to pause reminder';
      throw e;
    }
  }

  async function resumeReminder(id: number): Promise<Reminder | null> {
    try {
      const reminder = await remindersApi.resume(id);
      if (reminder) {
        const index = reminders.value.findIndex((r) => r.id === id);
        if (index !== -1) {
          reminders.value[index] = reminder;
        }
      }
      return reminder;
    } catch (e: any) {
      error.value = e.message || 'Failed to resume reminder';
      throw e;
    }
  }

  return {
    reminders,
    isLoading,
    error,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    snoozeReminder,
    pauseReminder,
    resumeReminder
  };
}
