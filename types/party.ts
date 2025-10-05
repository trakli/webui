export interface Party {
  id: number;
  type: string;
  name: string;
  description: string;
  icon: {
    id: number;
    path: string;
    type: string;
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

export interface PartyCreatePayload {
  type: string;
  name: string;
  description: string;
  icon: string;
  icon_type: string;
}

export interface PartyUpdatePayload {
  type?: string;
  name?: string;
  description?: string;
  icon?: string;
  icon_type?: string;
}

export interface PartiesResponse {
  last_sync: string;
  data: Party[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  last_sync?: string;
  message?: string;
  errors?: string[];
  status?: number;
}
