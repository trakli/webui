import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, defineComponent, h } from 'vue';
import type { Integration } from '~/types/integration';
import { useExtensionSlots } from '~/composables/useExtensionSlots';

const mockIntegrations = ref<Integration[]>([]);

vi.mock('~/composables/useIntegrations', () => ({
  useIntegrations: () => ({ integrations: mockIntegrations })
}));

function makeIntegration(overrides: Partial<Integration>): Integration {
  return {
    key: 'k',
    name: 'Name',
    description: null,
    category: 'import',
    icon: null,
    feature_key: null,
    configured: true,
    entitled: true,
    ui: null,
    ...overrides
  };
}

describe('useExtensionSlots', () => {
  beforeEach(() => {
    mockIntegrations.value = [];
  });

  it('collects only contributions that declare the slot', () => {
    mockIntegrations.value = [
      makeIntegration({ key: 'a', ui: { slots: ['settings.integrations'] } }),
      makeIntegration({ key: 'b', ui: { slots: ['dashboard.widgets'] } })
    ];

    const { contributionsFor } = useExtensionSlots();
    const settings = contributionsFor('settings.integrations');

    expect(settings.value.map((c) => c.key)).toEqual(['a']);
  });

  it('orders onboarding contributions by their declared order', () => {
    mockIntegrations.value = [
      makeIntegration({
        key: 'late',
        ui: { slots: ['onboarding.steps'], onboarding: { step: 's', order: 90 } }
      }),
      makeIntegration({
        key: 'early',
        ui: { slots: ['onboarding.steps'], onboarding: { step: 's', order: 20 } }
      })
    ];

    const { contributionsFor } = useExtensionSlots();
    const steps = contributionsFor('onboarding.steps');

    expect(steps.value.map((c) => c.key)).toEqual(['early', 'late']);
    expect(steps.value.map((c) => c.order)).toEqual([20, 90]);
  });

  it('hides contributions the user is not entitled to', () => {
    mockIntegrations.value = [
      makeIntegration({ key: 'free', entitled: true, ui: { slots: ['settings.integrations'] } }),
      makeIntegration({
        key: 'paid',
        feature_key: 'paid',
        entitled: false,
        ui: { slots: ['settings.integrations'] }
      })
    ];

    const { contributionsFor } = useExtensionSlots();

    expect(contributionsFor('settings.integrations').value.map((c) => c.key)).toEqual(['free']);
  });

  it('hides an unconfigured contribution by default', () => {
    mockIntegrations.value = [
      makeIntegration({
        key: 'ready',
        configured: true,
        ui: { slots: ['settings.integrations'] }
      }),
      makeIntegration({
        key: 'unset',
        configured: false,
        ui: { slots: ['settings.integrations'] }
      })
    ];

    const { contributionsFor } = useExtensionSlots();

    expect(contributionsFor('settings.integrations').value.map((c) => c.key)).toEqual(['ready']);
  });

  it('shows an unconfigured contribution when the descriptor opts in', () => {
    mockIntegrations.value = [
      makeIntegration({
        key: 'unset',
        configured: false,
        ui: { slots: ['settings.integrations'], show_when_unconfigured: true }
      })
    ];

    const { contributionsFor } = useExtensionSlots();
    const items = contributionsFor('settings.integrations').value;

    expect(items.map((c) => c.key)).toEqual(['unset']);
    expect(items[0].configured).toBe(false);
  });

  it('resolves a component a plugin layer registered for a slot key', () => {
    const { registerComponent, resolveComponent } = useExtensionSlots();
    const Custom = defineComponent({ render: () => h('div', 'custom') });

    expect(resolveComponent('plaid.connect')).toBeNull();
    registerComponent('plaid.connect', Custom);
    expect(resolveComponent('plaid.connect')).toBe(Custom);
  });
});
