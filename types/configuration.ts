export interface ConfigurationItem {
  id: number;
  user_id: number;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface ConfigurationPayload {
  key?: string;
  value: any;
  type?: string;
}

export interface ConfigurationsResponse {
  data: ConfigurationItem[];
  last_sync?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  status?: number;
}
