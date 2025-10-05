export interface Wallet {
  id: number;
  name: string;
  type: string;
  description: string;
  currency: string;
  balance: number;
  icon: {
    id: number;
    path: string;
    type: string;
  };
  stats: {
    total_income: number;
    total_expense: number;
  };
  sync_state: {
    id: number;
    syncable_id: number;
    client_generated_id: string;
    syncable_type: string;
    source: string;
    last_synced_at: string;
    created_at: string;
    deleted_at: string | null;
  };
}

export interface WalletCreatePayload {
  name: string;
  type: string;
  description: string;
  currency: string;
  balance?: number;
  icon: string;
  icon_type: string;
}

export interface WalletUpdatePayload {
  name?: string;
  type?: string;
  description?: string;
  currency?: string;
  balance?: number;
  icon?: string;
  icon_type?: string;
}

export interface WalletsResponse {
  last_sync: string;
  data: Wallet[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  last_sync?: string;
  message?: string;
  errors?: string[];
  status?: number;
}
