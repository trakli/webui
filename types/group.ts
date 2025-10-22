export interface Group {
  id: number;
  name: string;
  description: string;
  icon: {
    id: number;
    content: string;
    type: string;
    iconable_type: string;
    iconable_id: number;
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

export interface GroupCreatePayload {
  client_id: string;
  name: string;
  description: string;
  icon?: string;
  icon_type?: string;
  created_at: string;
}

export interface GroupUpdatePayload {
  client_id: string;
  name: string;
  description?: string;
  icon?: string;
  icon_type?: string;
}
