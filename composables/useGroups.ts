import { ref, computed } from 'vue';
import { useApi } from './useApi';

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
  icon: string;
  icon_type: string;
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

export const useGroups = () => {
  const api = useApi();
  const groups = ref<Group[]>([]);
  const lastSync = ref<string | null>(null);

  // Fetch all groups
  const fetchGroups = async (limit = 20, syncedSince?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (syncedSince) {
        params.append('synced_since', syncedSince);
      }

      const response = await api<ApiResponse<GroupsResponse>>(`/groups?${params.toString()}`);

      if (response.success && response.data) {
        groups.value = response.data.data || [];
        lastSync.value = response.data.last_sync || null;
      } else {
        throw new Error(response.message || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      groups.value = [];
      throw err;
    }
  };

  // Create new group
  const createGroup = async (data: Omit<CreateGroupPayload, 'client_id' | 'created_at'>) => {
    try {
      const payload: CreateGroupPayload = {
        ...data,
        client_id: `${crypto.randomUUID()}:${crypto.randomUUID()}`,
        created_at: new Date().toISOString()
      };

      const response = await api<ApiResponse<Group>>('/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.success && response.data) {
        groups.value = [response.data, ...groups.value];
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || response.message || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  // Update existing group
  const updateGroup = async (id: number, data: Partial<CreateGroupPayload>) => {
    try {
      const response = await api<ApiResponse<Group>>(`/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          client_id: `${crypto.randomUUID()}:${crypto.randomUUID()}`
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.success && response.data) {
        const index = groups.value.findIndex((g) => g.id === id);
        if (index !== -1) {
          groups.value[index] = response.data;
        }
        return response.data;
      } else {
        throw new Error(response.errors?.[0] || response.message || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  // Delete group
  const deleteGroup = async (id: number) => {
    try {
      const response = await api<ApiResponse<void>>(`/groups/${id}`, {
        method: 'DELETE'
      });

      if (response.success || response.status === 204) {
        groups.value = groups.value.filter((g) => g.id !== id);
      } else {
        throw new Error(response.errors?.[0] || response.message || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      throw err;
    }
  };

  return {
    groups: computed(() => groups.value),
    lastSync: computed(() => lastSync.value),
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
};
