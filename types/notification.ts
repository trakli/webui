export type NotificationType = 'reminder' | 'alert' | 'achievement' | 'system';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unread_count: number;
}

export interface NotificationPreferences {
  channels: {
    email: boolean;
    push: boolean;
    inapp: boolean;
  };
  types: {
    reminders: boolean;
    insights: boolean;
    inactivity: boolean;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  status?: number;
}
