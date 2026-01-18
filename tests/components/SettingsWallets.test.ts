import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import SettingsWallets from '@/components/settings/SettingsWallets.vue';

const mockWallets = [
  { id: 1, name: 'Main Wallet', currency: 'USD', client_generated_id: 'test-client-id-1' },
  { id: 2, name: 'Savings', currency: 'EUR', client_generated_id: 'test-client-id-2' }
];

const mockGroups = [
  { id: 1, name: 'Personal', client_generated_id: 'group-client-id-1' },
  { id: 2, name: 'Work', client_generated_id: 'group-client-id-2' }
];

const mockSharedData = {
  wallets: ref(mockWallets),
  groups: ref(mockGroups),
  getDefaultWallet: ref(mockWallets[0]),
  getDefaultGroup: ref(null),
  loadWallets: vi.fn().mockResolvedValue(undefined),
  loadGroups: vi.fn().mockResolvedValue(undefined),
  loadConfigurations: vi.fn().mockResolvedValue(undefined)
};

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => mockSharedData
}));

vi.mock('@/services/api/configurationsApi', () => ({
  default: {
    update: vi.fn().mockResolvedValue({})
  }
}));

vi.mock('@/services/api/walletsApi', () => ({
  default: {
    update: vi.fn().mockResolvedValue({})
  }
}));

vi.mock('@/services/api/groupsApi', () => ({
  default: {
    update: vi.fn().mockResolvedValue({})
  }
}));

describe('SettingsWallets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSharedData.wallets.value = mockWallets;
    mockSharedData.groups.value = mockGroups;
    mockSharedData.getDefaultWallet.value = mockWallets[0];
    mockSharedData.getDefaultGroup.value = null;
  });

  describe('wallet selection', () => {
    it('renders wallet options with numeric IDs', async () => {
      const wrapper = mount(SettingsWallets, {
        props: { isEditMode: true }
      });

      await flushPromises();

      const walletSelect = wrapper.findAll('select')[0];
      const options = walletSelect.findAll('option');
      expect(options.length).toBe(2);
      expect(options[0].attributes('value')).toBe('1');
      expect(options[1].attributes('value')).toBe('2');
    });

    it('can change wallet selection via v-model', async () => {
      const wrapper = mount(SettingsWallets, {
        props: { isEditMode: true }
      });

      await flushPromises();

      const walletSelect = wrapper.findAll('select')[0];
      expect(walletSelect.exists()).toBe(true);

      // Initial value should be set from default wallet
      expect((walletSelect.element as HTMLSelectElement).value).toBe('1');

      // Change selection to second wallet
      await walletSelect.setValue('2');
      await flushPromises();

      // Verify v-model updated the value
      expect((walletSelect.element as HTMLSelectElement).value).toBe('2');
    });

    it('displays wallet label in view mode after load', async () => {
      const wrapper = mount(SettingsWallets, {
        props: { isEditMode: false }
      });

      await flushPromises();

      const display = wrapper.find('.text-display');
      expect(display.exists()).toBe(true);
      expect(display.text()).toBe('Main Wallet');
    });
  });
});
