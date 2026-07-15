import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import WalletForm from '@/components/WalletForm.vue';
import { CURRENCIES } from '@/utils/currencies';

vi.stubGlobal('useI18n', () => ({ t: (k: string) => k }));

vi.mock('@/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([]),
    groups: ref([])
  })
}));

const codes = () =>
  mount(WalletForm)
    .findAll('#wallet-currency option')
    .map((o) => o.attributes('value'))
    .filter(Boolean);

describe('WalletForm currency options', () => {
  it('offers the currencies people actually hold, not a hand-picked few', () => {
    const offered = codes();

    // The wallet is the way into the app: a currency missing here can never
    // reach the transaction or transfer forms either, since those build their
    // list from the wallets you already have.
    expect(offered).toContain('INR');
    expect(offered).toContain('BRL');
    expect(offered).toContain('IDR');
    expect(offered).toContain('NGN');
    expect(offered).toContain('USD');
  });

  it('offers every currency the app claims to support', () => {
    const offered = codes();

    CURRENCIES.forEach((c) => expect(offered).toContain(c.code));
  });
});
