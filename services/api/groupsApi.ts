interface GroupIcon {
  id: number;
  path: string;
  type: string;
}

interface SyncState {
  id: number;
  syncable_id: number;
  client_generated_id: number;
  syncable_type: string;
  source: string;
  last_synced_at: string;
  created_at: string;
  deleted_at: string | null;
}

interface Group {
  id: number;
  name: string;
  description: string;
  icon: GroupIcon;
  sync_state: SyncState;
}

interface CreateGroupPayload {
  client_id: string;
  name: string;
  description: string;
  icon?: string;
  icon_type?: string;
  created_at: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
  errors?: string[];
}

interface GroupsResponse {
  last_sync: string;
  data: Group[];
}

/**
 * Groups API Service
 * Handles all HTTP requests to the groups endpoints
 */
const groupsApi = {
  /**
   * Fetch all groups
   * GET /groups
   */
  async fetchAll(limit = 20, syncedSince?: string): Promise<GroupsResponse> {
    const api = useApi();
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (syncedSince) {
      params.append('synced_since', syncedSince);
    }

    const response = await api<ApiResponse<GroupsResponse>>(`/groups?${params.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    return {
      last_sync: new Date().toISOString(),
      data: []
    };
  },

  /**
   * Create a new group
   * POST /groups
   */
  async create(data: Omit<CreateGroupPayload, 'client_id' | 'created_at'>): Promise<Group | null> {
    const api = useApi();

    const payload: CreateGroupPayload = {
      ...data,
      client_id: `${crypto.randomUUID()}:${crypto.randomUUID()}`,
      created_at: new Date().toISOString()
    };

    try {
      const response = await api<ApiResponse<Group>>('/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.errors?.[0] || response.message || 'Failed to create group');
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  /**
   * Update an existing group
   * PUT /groups/{id}
   */
  async update(id: number, data: Partial<CreateGroupPayload>): Promise<Group | null> {
    const api = useApi();

    try {
      const response = await api<ApiResponse<Group>>(`/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.errors?.[0] || response.message || 'Failed to update group');
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  /**
   * Delete a group
   * DELETE /groups/{id}
   */
  async delete(id: number): Promise<boolean> {
    const api = useApi();

    try {
      const response = await api<ApiResponse<void>>(`/groups/${id}`, {
        method: 'DELETE'
      });

      if (response.success || response.status === 204) {
        return true;
      }

      throw new Error(response.errors?.[0] || response.message || 'Failed to delete group');
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
};

export default groupsApi;
export { groupsApi };
export type { Group, CreateGroupPayload, GroupsResponse };
