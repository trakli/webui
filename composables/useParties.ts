import type { PartyCreatePayload, PartyUpdatePayload } from '~/types/party';
import { api } from '~/services/api';
import { useSharedData } from '~/composables/useSharedData';

export const useParties = () => {
  const sharedData = useSharedData();

  const normalizeIcon = (icon: string | { path?: string } | undefined): string => {
    if (typeof icon === 'string') return icon;
    if (typeof icon === 'object' && icon?.path) return icon.path;
    return '';
  };

  const fetchParties = async () => {
    return sharedData.loadParties();
  };

  const createParty = async (data: PartyCreatePayload) => {
    try {
      const payload = {
        ...data,
        icon: normalizeIcon(data.icon),
        icon_type: 'image'
      };

      const created = await api.parties.create(payload);
      if (created) {
        sharedData.addParty(created);
      }
      return { data: created };
    } catch (err) {
      console.error('Error creating party:', err);
      throw err;
    }
  };

  const updateParty = async (id: number, data: PartyUpdatePayload) => {
    try {
      const payload = {
        ...data,
        ...(data.icon && { icon: normalizeIcon(data.icon), icon_type: 'image' })
      };

      const updated = await api.parties.update(id, payload);
      if (updated) {
        sharedData.updateParty(id, updated);
      }
      return { data: updated };
    } catch (err) {
      console.error('Error updating party:', err);
      throw err;
    }
  };

  const deleteParty = async (id: number) => {
    try {
      const success = await api.parties.delete(id);
      if (success) {
        sharedData.removeParty(id);
      }
      return success;
    } catch (err) {
      console.error('Error deleting party:', err);
      throw err;
    }
  };

  return {
    parties: sharedData.parties,
    lastSync: sharedData.partiesLastSync,
    isLoading: sharedData.partiesLoading,
    error: sharedData.partiesError,
    fetchParties,
    createParty,
    updateParty,
    deleteParty
  };
};
