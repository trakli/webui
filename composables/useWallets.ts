import type { WalletCreatePayload, WalletUpdatePayload } from '~/types/wallet';
import { api } from '~/services/api';
import { useSharedData } from '~/composables/useSharedData';

export const useWallets = () => {
  const sharedData = useSharedData();

  const normalizeIcon = (icon: string | { path?: string } | undefined): string => {
    if (typeof icon === 'string') return icon;
    if (typeof icon === 'object' && icon?.path) return icon.path;
    return '';
  };

  const fetchWallets = async () => {
    return sharedData.loadWallets();
  };

  const createWallet = async (data: WalletCreatePayload) => {
    try {
      const normalized = normalizeIcon(data.icon);
      const payload = {
        ...data,
        ...(normalized && { icon: normalized, icon_type: 'image' }),
        balance: data.balance || 0
      };

      const created = await api.wallets.create(payload);
      if (created) {
        sharedData.addWallet(created);
      }
      return { data: created };
    } catch (err) {
      console.error('Error creating wallet:', err);
      throw err;
    }
  };

  const updateWallet = async (id: number, data: WalletUpdatePayload) => {
    try {
      const payload = {
        ...data,
        ...(data.icon && { icon: normalizeIcon(data.icon), icon_type: 'image' })
      };

      const updated = await api.wallets.update(id, payload);
      if (updated) {
        sharedData.updateWallet(id, updated);
      }
      return { data: updated };
    } catch (err) {
      console.error('Error updating wallet:', err);
      throw err;
    }
  };

  const deleteWallet = async (id: number) => {
    try {
      const success = await api.wallets.delete(id);
      if (success) {
        sharedData.removeWallet(id);
      }
      return success;
    } catch (err) {
      console.error('Error deleting wallet:', err);
      throw err;
    }
  };

  return {
    wallets: sharedData.wallets,
    lastSync: sharedData.walletsLastSync,
    isLoading: sharedData.walletsLoading,
    error: sharedData.walletsError,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet
  };
};
