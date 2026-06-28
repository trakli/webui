/**
 * Slots a plugin descriptor can target. These names are the contract shared
 * with the backend (see trakli/internal#9); a contribution only renders in a
 * declared slot.
 */
export type ExtensionSlot =
  | 'settings.integrations'
  | 'settings.tabs'
  | 'onboarding.steps'
  | 'dashboard.widgets'
  | 'sidebar.nav';

export interface IntegrationCardDescriptor {
  title: string;
  cta?: string;
  description?: string;
  href?: string;
}

export interface IntegrationConnectDescriptor {
  type: string;
  [key: string]: unknown;
}

export interface IntegrationOnboardingDescriptor {
  step: string;
  optional?: boolean;
  order?: number;
  title?: string;
  description?: string;
  href?: string;
}

export interface IntegrationUiDescriptor {
  slots: ExtensionSlot[];
  card?: IntegrationCardDescriptor | null;
  connect?: IntegrationConnectDescriptor | null;
  onboarding?: IntegrationOnboardingDescriptor | null;
  /** Slot key a plugin Nuxt layer registered a real component for, else null. */
  component?: string | null;
  /**
   * Render this contribution even when the integration is not configured,
   * surfacing an explicit needs-setup state instead of hiding it. Default is
   * to hide unconfigured contributions.
   */
  show_when_unconfigured?: boolean;
}

export interface Integration {
  key: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  feature_key: string | null;
  configured: boolean;
  entitled: boolean;
  ui: IntegrationUiDescriptor | null;
}

/**
 * One integration's contribution to a single slot, flattened from its `ui`
 * descriptor and carrying the gating state the registry resolved.
 */
export interface SlotContribution {
  key: string;
  slot: ExtensionSlot;
  integration: Integration;
  ui: IntegrationUiDescriptor;
  order: number;
  /** Operator has supplied what the integration needs to run. */
  configured: boolean;
}
