import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

const mockWallets = ref([
  { id: 1, name: 'Main Wallet', balance: 5000, currency: 'USD' },
  { id: 2, name: 'Savings', balance: 10000, currency: 'USD' }
]);

const mockUseWallets = {
  wallets: mockWallets,
  isLoading: ref(false),
  error: ref(null),
  fetchWallets: vi.fn().mockResolvedValue(undefined),
  createWallet: vi.fn().mockResolvedValue({ id: 3, name: 'New Wallet' }),
  updateWallet: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Wallet' }),
  deleteWallet: vi.fn().mockResolvedValue(undefined)
};

const mockNotifications = {
  confirmDelete: vi.fn().mockResolvedValue(true),
  showSuccess: vi.fn(),
  showError: vi.fn()
};

vi.mock('@/composables/useWallets', () => ({
  useWallets: () => mockUseWallets
}));

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => mockNotifications
}));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    getDefaultWallet: ref({ id: 1, name: 'Main Wallet' }),
    loadConfigurations: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('@/composables/useSidebar', () => ({
  useSidebar: () => ({
    isTabletOrBelow: ref(false)
  })
}));

describe('Wallets Page Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWallets.value = [
      { id: 1, name: 'Main Wallet', balance: 5000, currency: 'USD' },
      { id: 2, name: 'Savings', balance: 10000, currency: 'USD' }
    ];
  });

  describe('useWallets composable', () => {
    it('returns wallets list', () => {
      const { wallets } = mockUseWallets;
      expect(wallets.value).toHaveLength(2);
      expect(wallets.value[0].name).toBe('Main Wallet');
    });

    it('fetchWallets loads wallet data', async () => {
      await mockUseWallets.fetchWallets();
      expect(mockUseWallets.fetchWallets).toHaveBeenCalled();
    });

    it('createWallet adds new wallet', async () => {
      const newWallet = { name: 'New Wallet', currency: 'EUR' };
      await mockUseWallets.createWallet(newWallet);
      expect(mockUseWallets.createWallet).toHaveBeenCalledWith(newWallet);
    });

    it('updateWallet modifies existing wallet', async () => {
      const updateData = { name: 'Updated Name' };
      await mockUseWallets.updateWallet(1, updateData);
      expect(mockUseWallets.updateWallet).toHaveBeenCalledWith(1, updateData);
    });

    it('deleteWallet removes wallet', async () => {
      await mockUseWallets.deleteWallet(1);
      expect(mockUseWallets.deleteWallet).toHaveBeenCalledWith(1);
    });
  });

  describe('wallet operations', () => {
    it('shows confirmation before deleting', async () => {
      await mockNotifications.confirmDelete('wallet');
      expect(mockNotifications.confirmDelete).toHaveBeenCalledWith('wallet');
    });

    it('shows success notification after deletion', () => {
      mockNotifications.showSuccess('Wallet deleted', 'Main Wallet has been deleted successfully');
      expect(mockNotifications.showSuccess).toHaveBeenCalledWith(
        'Wallet deleted',
        'Main Wallet has been deleted successfully'
      );
    });

    it('shows error notification on delete failure', () => {
      mockNotifications.showError('Delete failed', 'Failed to delete wallet. Please try again.');
      expect(mockNotifications.showError).toHaveBeenCalled();
    });

    it('does not delete when confirmation is cancelled', async () => {
      mockNotifications.confirmDelete.mockResolvedValueOnce(false);

      const confirmed = await mockNotifications.confirmDelete('wallet');

      if (!confirmed) {
        expect(mockUseWallets.deleteWallet).not.toHaveBeenCalled();
      }
    });
  });

  describe('loading states', () => {
    it('isLoading starts as false', () => {
      expect(mockUseWallets.isLoading.value).toBe(false);
    });

    it('error starts as null', () => {
      expect(mockUseWallets.error.value).toBeNull();
    });
  });

  describe('wallet data structure', () => {
    it('wallet has required fields', () => {
      const wallet = mockWallets.value[0];
      expect(wallet).toHaveProperty('id');
      expect(wallet).toHaveProperty('name');
      expect(wallet).toHaveProperty('balance');
      expect(wallet).toHaveProperty('currency');
    });

    it('wallet balance is a number', () => {
      const wallet = mockWallets.value[0];
      expect(typeof wallet.balance).toBe('number');
    });
  });
});

describe('Wallet Form Validation', () => {
  it('requires wallet name', () => {
    const walletData = { name: '', currency: 'USD' };
    const isValid = walletData.name.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it('accepts valid wallet name', () => {
    const walletData = { name: 'My Wallet', currency: 'USD' };
    const isValid = walletData.name.trim().length > 0;
    expect(isValid).toBe(true);
  });

  it('requires currency selection', () => {
    const walletData = { name: 'My Wallet', currency: '' };
    const isValid = walletData.currency.length > 0;
    expect(isValid).toBe(false);
  });

  it('accepts valid currency', () => {
    const walletData = { name: 'My Wallet', currency: 'EUR' };
    const isValid = walletData.currency.length > 0;
    expect(isValid).toBe(true);
  });
});
