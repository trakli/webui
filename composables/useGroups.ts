import { api } from '~/services/api';
import { useSharedData } from '~/composables/useSharedData';

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
  const sharedData = useSharedData();

  const fetchGroups = async () => {
    return sharedData.loadGroups();
  };

  const createGroup = async (data: Omit<CreateGroupPayload, 'client_id' | 'created_at'>) => {
    try {
      const payload: CreateGroupPayload = {
        ...data,
        client_id: `${crypto.randomUUID()}:${crypto.randomUUID()}`,
        created_at: new Date().toISOString()
      };

      const created = await api.groups.create(payload);
      if (created) {
        sharedData.addGroup(created);
      }
      return created;
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  const updateGroup = async (id: number, data: Partial<CreateGroupPayload>) => {
    try {
      const payload = {
        ...data,
        client_id: `${crypto.randomUUID()}:${crypto.randomUUID()}`
      };

      const updated = await api.groups.update(id, payload);
      if (updated) {
        sharedData.updateGroup(id, updated);
      }
      return updated;
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      const success = await api.groups.delete(id);
      if (success) {
        sharedData.removeGroup(id);
      }
      return success;
    } catch (err) {
      console.error('Error deleting group:', err);
      throw err;
    }
  };

  return {
    groups: sharedData.groups,
    lastSync: sharedData.groupsLastSync,
    isLoading: sharedData.groupsLoading,
    error: sharedData.groupsError,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
};
