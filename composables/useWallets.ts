import { ref, readonly } from 'vue';
import type {
  Wallet,
  WalletCreatePayload,
  WalletUpdatePayload,
  WalletsResponse,
  ApiResponse
} from '~/types/wallet';

export const useWallets = () => {
  const api = useApi();
  const wallets = ref<Wallet[]>([]);
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

  const fetchWallets = async (limit = 20, syncedSince?: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (syncedSince) {
        params.append('synced_since', syncedSince);
      }

      const queryString = params.toString();
      const url = queryString ? `/wallets?${queryString}` : '/wallets';

      const response = await api<ApiResponse<WalletsResponse>>(url);

      if (response?.data) {
        wallets.value = response.data.data || [];
        lastSync.value = response.data.last_sync || new Date().toISOString();
      } else if (response?.last_sync && response?.data) {
        // Direct response format
        wallets.value = (response as any).data || [];
        lastSync.value = (response as any).last_sync || new Date().toISOString();
      }
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error fetching wallets:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createWallet = async (data: WalletCreatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        icon: normalizeIcon(data.icon),
        icon_type: 'image',
        balance: data.balance || 0
      };

      const response = await api<ApiResponse<Wallet>>('/wallets', {
        method: 'POST',
        body: payload
      });

      // Add to local state if successful
      if (response?.data) {
        wallets.value.unshift(response.data);
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error creating wallet:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateWallet = async (id: number, data: WalletUpdatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        ...(data.icon && { icon: normalizeIcon(data.icon), icon_type: 'image' })
      };

      const response = await api<ApiResponse<Wallet>>(`/wallets/${id}`, {
        method: 'PUT',
        body: payload
      });

      // Update local state
      const index = wallets.value.findIndex((wallet) => wallet.id === id);
      if (index !== -1 && response?.data) {
        wallets.value[index] = response.data;
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error updating wallet:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteWallet = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await api(`/wallets/${id}`, {
        method: 'DELETE'
      });

      // Remove from local state
      wallets.value = wallets.value.filter((wallet) => wallet.id !== id);
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error deleting wallet:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    wallets: readonly(wallets),
    lastSync: readonly(lastSync),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet
  };
};
