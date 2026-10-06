import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import BankPage from '~/pages/banks.vue';
const request = vi.hoisted(() => vi.fn());
vi.mock('~/composables/useApi', () => ({ useApi: () => request }));
vi.mock('~/composables/useWallets', () => ({
  useWallets: () => ({ wallets: ref([]), fetchWallets: async () => [] })
}));
vi.stubGlobal('definePageMeta', vi.fn());
vi.stubGlobal('navigateTo', vi.fn());
const connection = {
  id: 8,
  institution_name: 'Selected bank',
  status: 'connected',
  is_active: true,
  disconnected_at: null,
  last_synced_at: null
};
beforeEach(() => {
  request.mockReset();
  vi.stubGlobal('useRoute', () => ({ query: {} }));
  request.mockImplementation((path: string) =>
    Promise.resolve({
      success: true,
      message: 'Success',
      data:
        path === '/cloud/billing/status'
          ? { paid_access: false }
          : { data: [connection], current_page: 1, last_page: 1, per_page: 100, total: 1 }
    })
  );
});
function render() {
  return mount(BankPage, {
    global: {
      stubs: {
        TCard: { template: '<div><slot /></div>' },
        ComponentLoader: { template: '<div><slot /></div>' },
        TButton: {
          props: ['text', 'disabled'],
          template: '<button :disabled="disabled">{{ text }}</button>'
        },
        NuxtLink: { template: '<a><slot /></a>' }
      }
    }
  });
}
describe('expired bank access', () => {
  it('offers a new session after a partial connection outcome and retains connected banks', async () => {
    vi.stubGlobal('useRoute', () => ({ query: { session: '21' } }));
    request.mockImplementation((path: string) =>
      Promise.resolve({
        success: true,
        message: 'Success',
        data:
          path === '/cloud/billing/status'
            ? { paid_access: true }
            : path === '/plaid/link-sessions/21'
              ? { id: 21, status: 'partial_relink' }
              : path === '/plaid/link-sessions'
                ? { id: 22, status: 'pending', url: 'https://example.invalid/bank' }
                : { data: [connection], current_page: 1, last_page: 1, per_page: 100, total: 1 }
      })
    );
    const page = render();
    await flushPromises();
    expect(page.text()).toContain('Selected bank');
    expect(page.text()).toContain('Banks already connected remain available.');
    await page
      .findAll('button')
      .find((button) => button.text() === 'Start a new connection session')!
      .trigger('click');
    await flushPromises();
    expect(request).toHaveBeenCalledWith('/plaid/link-sessions', { method: 'POST' });
    expect(page.text()).toContain('Selected bank');
  });
  it('keeps bank history and disconnect available while hiding paid actions', async () => {
    const page = render();
    await flushPromises();
    expect(page.text()).toContain('Selected bank');
    expect(page.text()).toContain('Disconnect');
    expect(page.text()).not.toContain('Choose accounts');
    expect(page.text()).not.toContain('Synchronize');
    expect(page.text()).not.toContain('Reconnect');
    expect(page.text()).toContain('Upgrade');
  });
  it('confirms and disconnects only the selected bank', async () => {
    const page = render();
    await flushPromises();
    await page
      .findAll('button')
      .find((button) => button.text() === 'Disconnect')!
      .trigger('click');
    expect(page.text()).toContain('Your imported transactions stay available.');
    await page
      .findAll('button')
      .filter((button) => button.text() === 'Disconnect')
      .at(-1)!
      .trigger('click');
    await flushPromises();
    expect(request).toHaveBeenCalledWith('/plaid/connections/8', { method: 'DELETE' });
    expect(request).not.toHaveBeenCalledWith('/plaid/connections', { method: 'DELETE' });
  });
});
