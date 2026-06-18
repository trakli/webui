import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardAgentHero from '@/components/dashboard/DashboardAgentHero.vue';
import { usePendingAsk } from '@/composables/usePendingAsk';

const push = vi.fn();

vi.mock('nuxt/app', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ user: ref({ first_name: 'Sam' }) })
}));
vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([]),
    parties: ref([]),
    loadWallets: vi.fn(),
    loadParties: vi.fn()
  })
}));
vi.mock('@/composables/useTransactions', () => ({
  useTransactions: () => ({ addTransaction: vi.fn(), refreshTransactions: vi.fn() })
}));
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({ showSuccess: vi.fn(), showError: vi.fn() })
}));
vi.mock('@/services/api/transfersApi', () => ({
  default: { create: vi.fn() },
  transfersApi: { create: vi.fn() }
}));

const stubs = { teleport: true };

describe('DashboardAgentHero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Drain any leftover pending ask between tests.
    usePendingAsk().consumePendingAsk();
  });

  it('greets the user by their real name', () => {
    const w = mount(DashboardAgentHero, { global: { stubs } });
    expect(w.find('.hero-title').text()).toContain('Sam');
  });

  it('hands a freeform ask to the chat and navigates', async () => {
    const w = mount(DashboardAgentHero, { global: { stubs } });

    await w.find('.hero-input').setValue('show my spending');
    await w.find('.hero-ask').trigger('submit');

    expect(push).toHaveBeenCalledWith('/home');
    expect(usePendingAsk().consumePendingAsk()?.text).toBe('show my spending');
  });

  it('runs the build-report quick action through to navigation', async () => {
    const w = mount(DashboardAgentHero, { global: { stubs } });

    // Third chip is "Build a report" (after Log and Transfer).
    await w.findAll('.agent-chip')[2].trigger('click');
    await w.find('.qa-submit').trigger('click');

    expect(push).toHaveBeenCalledWith('/home');
    expect(usePendingAsk().consumePendingAsk()?.text).toContain('Build a financial report');
  });
});
