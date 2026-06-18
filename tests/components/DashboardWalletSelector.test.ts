import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardWalletSelector from '@/components/dashboard/DashboardWalletSelector.vue';

const mockUseStatistics = {
  selectedWalletId: ref(null),
  availableWallets: ref([
    { id: null, name: 'All Wallets' },
    { id: 1, name: 'Main Wallet' }
  ]),
  setSelectedWallet: vi.fn()
};

vi.mock('@/composables/useStatistics', () => ({
  useStatistics: () => mockUseStatistics
}));

const stubs = {
  ChevronDown: { template: '<span />' },
  Wallet: { template: '<span />' },
  teleport: true
};

describe('DashboardWalletSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStatistics.selectedWalletId.value = null;
  });

  it('renders the wallet selector', () => {
    const wrapper = mount(DashboardWalletSelector, { global: { stubs } });
    expect(wrapper.find('.wallet-selector').exists()).toBe(true);
  });

  it('shows "All Wallets" by default', () => {
    const wrapper = mount(DashboardWalletSelector, { global: { stubs } });
    expect(wrapper.find('.wallet-name').text()).toBe('All Wallets');
  });

  it('toggles dropdown on click', async () => {
    const wrapper = mount(DashboardWalletSelector, { global: { stubs } });

    expect(wrapper.find('.wallet-dropdown').exists()).toBe(false);
    await wrapper.find('.wallet-selector').trigger('click');
    expect(wrapper.find('.wallet-dropdown').exists()).toBe(true);
  });

  it('shows wallet options in dropdown', async () => {
    const wrapper = mount(DashboardWalletSelector, { global: { stubs } });

    await wrapper.find('.wallet-selector').trigger('click');

    const options = wrapper.findAll('.wallet-option');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('All Wallets');
    expect(options[1].text()).toBe('Main Wallet');
  });

  it('calls setSelectedWallet when an option is clicked', async () => {
    const wrapper = mount(DashboardWalletSelector, { global: { stubs } });

    await wrapper.find('.wallet-selector').trigger('click');
    await wrapper.findAll('.wallet-option')[1].trigger('click');

    expect(mockUseStatistics.setSelectedWallet).toHaveBeenCalledWith(1);
  });
});
