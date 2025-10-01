export interface Category {
  id: number;
  name: string;
  description: string;
  type: 'income' | 'expense';
  icon: {
    id: number;
    path: string;
    type: string;
  };
  sync_state: {
    id: number;
    syncable_id: number;
    client_generated_id: number;
    syncable_type: string;
    source: string;
    last_synced_at: string;
    created_at: string;
    deleted_at: string | null;
  };
}

export interface CategoryCreatePayload {
  name: string;
  description: string;
  type: 'income' | 'expense';
  icon: string;
  icon_type: string;
}

export interface CategoryUpdatePayload {
  name?: string;
  description?: string;
  type?: 'income' | 'expense';
  icon?: string;
  icon_type?: string;
}

export interface CategoriesResponse {
  last_sync: string;
  data: Category[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  last_sync?: string;
  message?: string;
  errors?: string[];
  status?: number;
}
