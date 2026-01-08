export type ReminderStatus = 'active' | 'paused' | 'snoozed' | 'completed' | 'cancelled';
export type ReminderType =
  | 'daily_tracking'
  | 'weekly_review'
  | 'monthly_summary'
  | 'bill_due'
  | 'budget_alert'
  | 'custom';

export interface Reminder {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  type: ReminderType;
  trigger_at: string;
  timezone: string;
  repeat_rule: string | null;
  next_trigger_at: string | null;
  last_triggered_at: string | null;
  status: ReminderStatus;
  priority: number;
  snoozed_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderCreatePayload {
  title: string;
  description?: string;
  type: ReminderType;
  trigger_at: string;
  timezone?: string;
  repeat_rule?: string;
  priority?: number;
}

export interface ReminderUpdatePayload {
  title?: string;
  description?: string;
  type?: ReminderType;
  trigger_at?: string;
  timezone?: string;
  repeat_rule?: string;
  status?: ReminderStatus;
  priority?: number;
}

export interface ReminderSnoozePayload {
  duration: number;
}

export interface RemindersResponse {
  last_sync: string;
  data: Reminder[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  last_sync?: string;
  message?: string;
  errors?: string[];
  status?: number;
}
