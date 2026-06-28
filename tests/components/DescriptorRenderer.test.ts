import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import DescriptorRenderer from '~/components/extensions/DescriptorRenderer.vue';
import { useExtensionSlots } from '~/composables/useExtensionSlots';
import type { SlotContribution } from '~/types/integration';

const stubs = {
  NuxtLink: { template: '<a><slot /></a>' }
};

function contribution(overrides: Partial<SlotContribution> = {}): SlotContribution {
  return {
    key: 'statement-import',
    slot: 'settings.integrations',
    order: 100,
    configured: true,
    integration: {
      key: 'statement-import',
      name: 'Statement Import',
      description: 'desc',
      category: 'import',
      icon: null,
      feature_key: null,
      configured: true,
      entitled: true,
      ui: null
    },
    ui: {
      slots: ['settings.integrations'],
      card: { title: 'Import bank statements', cta: 'Import', description: 'Upload a statement' },
      component: null
    },
    ...overrides
  };
}

describe('DescriptorRenderer', () => {
  it('renders an integration card from the descriptor (no plugin JS)', () => {
    const wrapper = mount(DescriptorRenderer, {
      props: { contribution: contribution() },
      global: { stubs }
    });

    expect(wrapper.text()).toContain('Import bank statements');
    expect(wrapper.text()).toContain('Import');
  });

  it('shows a needs-setup badge when the integration is not configured', () => {
    const wrapper = mount(DescriptorRenderer, {
      props: { contribution: contribution({ configured: false }) },
      global: { stubs }
    });

    expect(wrapper.text()).toContain('Needs setup');
  });

  it('renders a registered component when the descriptor sets ui.component (escape hatch)', () => {
    const Custom = defineComponent({ render: () => h('div', 'CUSTOM-WIDGET') });
    useExtensionSlots().registerComponent('statement-import.custom', Custom);

    const wrapper = mount(DescriptorRenderer, {
      props: {
        contribution: contribution({
          ui: {
            slots: ['settings.integrations'],
            card: { title: 'unused' },
            component: 'statement-import.custom'
          }
        })
      },
      global: { stubs }
    });

    expect(wrapper.text()).toContain('CUSTOM-WIDGET');
    expect(wrapper.text()).not.toContain('unused');
  });
});
