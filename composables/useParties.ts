import { ref, readonly } from 'vue';
import type {
  Party,
  PartyCreatePayload,
  PartyUpdatePayload,
  PartiesResponse,
  ApiResponse
} from '~/types/party';

export const useParties = () => {
  const api = useApi();
  const parties = ref<Party[]>([]);
  const lastSync = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Helper function to normalize icon to string
  const normalizeIcon = (icon: any): string => {
    if (typeof icon === 'string') return icon;
    if (typeof icon === 'object' && icon?.path) return icon.path;
    return '';
  };

  // Helper function to extract API errors
  const extractApiErrors = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.response?._data?.message) return err.response._data.message;
    if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
    if (err?.message) return err.message;
    if (err?._data?.message) return err._data.message;
    if (err?._data?.errors?.length) return err._data.errors.join(', ');
    return 'An unknown error occurred';
  };

  const fetchParties = async (limit = 20, syncedSince?: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (syncedSince) {
        params.append('synced_since', syncedSince);
      }

      const queryString = params.toString();
      const url = queryString ? `/parties?${queryString}` : '/parties';

      const response = await api<ApiResponse<PartiesResponse>>(url);

      if (response?.data) {
        parties.value = response.data.data || [];
        lastSync.value = response.data.last_sync || new Date().toISOString();
      } else if (response?.last_sync && response?.data) {
        // Direct response format
        parties.value = (response as any).data || [];
        lastSync.value = (response as any).last_sync || new Date().toISOString();
      }
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error fetching parties:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createParty = async (data: PartyCreatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        icon: normalizeIcon(data.icon),
        icon_type: 'image'
      };

      const response = await api<ApiResponse<Party>>('/parties', {
        method: 'POST',
        body: payload
      });

      // Add to local state if successful
      if (response?.data) {
        parties.value.unshift(response.data);
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error creating party:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateParty = async (id: number, data: PartyUpdatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        ...(data.icon && { icon: normalizeIcon(data.icon), icon_type: 'image' })
      };

      const response = await api<ApiResponse<Party>>(`/parties/${id}`, {
        method: 'PUT',
        body: payload
      });

      // Update local state
      const index = parties.value.findIndex((party) => party.id === id);
      if (index !== -1 && response?.data) {
        parties.value[index] = response.data;
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error updating party:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteParty = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await api(`/parties/${id}`, {
        method: 'DELETE'
      });

      // Remove from local state
      parties.value = parties.value.filter((party) => party.id !== id);
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error deleting party:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    parties: readonly(parties),
    lastSync: readonly(lastSync),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchParties,
    createParty,
    updateParty,
    deleteParty
  };
};
