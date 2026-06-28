import { computed, markRaw, ref } from 'vue';
import type { Component } from 'vue';
import type { ExtensionSlot, SlotContribution } from '~/types/integration';
import { useIntegrations } from '~/composables/useIntegrations';

const DEFAULT_ORDER = 100;

// Components a plugin Nuxt layer registers for a slot key (the escape hatch).
const componentRegistry = ref<Record<string, Component>>({});

/**
 * Collects what installed integrations contribute to each named slot, ordered
 * and gated, and resolves the optional custom component a plugin layer can
 * register. The common cases render with no plugin JS; a registered component
 * is the escape hatch.
 */
export const useExtensionSlots = () => {
  const { integrations } = useIntegrations();

  const contributionsFor = (slot: ExtensionSlot) =>
    computed<SlotContribution[]>(() => {
      const items: SlotContribution[] = [];

      for (const integration of integrations.value) {
        const ui = integration.ui;
        if (!ui || !Array.isArray(ui.slots) || !ui.slots.includes(slot)) {
          continue;
        }

        // Hard gate: never surface something the user is not entitled to. The
        // server owns the paid-vs-free decision; the client only honors it.
        if (!integration.entitled) {
          continue;
        }

        // Hide contributions that are not ready to use unless the descriptor
        // asks to surface an explicit needs-setup state.
        if (!integration.configured && !ui.show_when_unconfigured) {
          continue;
        }

        items.push({
          key: integration.key,
          slot,
          integration: integration as SlotContribution['integration'],
          ui,
          order:
            slot === 'onboarding.steps' ? (ui.onboarding?.order ?? DEFAULT_ORDER) : DEFAULT_ORDER,
          configured: integration.configured
        });
      }

      return items.sort((a, b) => a.order - b.order);
    });

  /**
   * Register a real component for a slot key, used when a descriptor sets
   * `ui.component`. Called from a plugin Nuxt layer.
   */
  const registerComponent = (slotKey: string, component: Component): void => {
    componentRegistry.value = {
      ...componentRegistry.value,
      [slotKey]: markRaw(component)
    };
  };

  const resolveComponent = (slotKey: string | null | undefined): Component | null =>
    slotKey ? (componentRegistry.value[slotKey] ?? null) : null;

  return {
    contributionsFor,
    registerComponent,
    resolveComponent
  };
};
