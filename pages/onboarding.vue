<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <div class="onboarding-header">
        <div class="welcome-section">
          <h1 class="main-title">{{ $t('Welcome to Trakli!') }}</h1>
          <p class="subtitle">{{ $t("Let's set up your account in just a few steps") }}</p>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }" />
          </div>
          <span class="progress-text">{{
            $t('Step {current} of {total}', { current: currentStep, total: totalSteps })
          }}</span>
        </div>
      </div>

      <div class="onboarding-content">
        <!-- Step: Language Selection -->
        <div v-if="currentStepId === 'language'" class="step-content">
          <div class="step-icon">
            <IconLanguage />
          </div>
          <div class="step-info">
            <h2 class="step-title">{{ $t('Choose your language') }}</h2>
            <p class="step-description">
              {{
                $t(
                  'Select your preferred language for Trakli. You can change this later in settings.'
                )
              }}
            </p>
          </div>
          <div class="step-form">
            <div class="language-setup">
              <div class="language-grid">
                <button
                  v-for="language in availableLanguages"
                  :key="language.code"
                  class="language-option"
                  :class="{ selected: selectedLanguage === language.code }"
                  @click="selectLanguage(language.code)"
                >
                  <span class="language-flag">{{ language.flag }}</span>
                  <span class="language-name">{{ language.name }}</span>
                </button>
              </div>

              <div class="country-field">
                <label class="country-label">{{ $t('Where are you based?') }}</label>
                <select v-model="selectedCountry" class="country-select">
                  <option value="">{{ $t('Select your country') }}</option>
                  <option v-for="country in countries" :key="country.code" :value="country.name">
                    {{ country.name }}
                  </option>
                </select>
              </div>

              <div class="step-actions">
                <button
                  class="primary-btn"
                  :disabled="!selectedLanguage"
                  @click="handleLanguageSelection"
                >
                  {{ $t('Continue') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step: Wallet and Currency Setup -->
        <div v-if="currentStepId === 'wallet'" class="step-content">
          <div class="step-icon">
            <IconWallet />
          </div>
          <div class="step-info">
            <h2 class="step-title">{{ $t('Set up your wallet') }}</h2>
            <p class="step-description">
              {{ $t('Configure your default wallet and currency for tracking transactions.') }}
            </p>
          </div>
          <div class="step-form">
            <div class="wallet-currency-setup">
              <div class="wallet-currency-columns">
                <div class="wallet-column">
                  <label class="column-label">{{ $t('Default wallet') }}</label>
                  <div class="wallet-cards">
                    <div
                      class="wallet-card"
                      :class="{ selected: walletChoice === 'use-default' }"
                      @click="walletChoice = 'use-default'"
                    >
                      <input
                        v-model="walletChoice"
                        type="radio"
                        value="use-default"
                        class="wallet-radio"
                        @click.stop
                      />
                      <div class="wallet-card-content">
                        <span class="wallet-card-title">{{ $t('Use Main Wallet') }}</span>
                        <span class="wallet-card-desc">{{
                          $t('Keep the default wallet name')
                        }}</span>
                      </div>
                    </div>

                    <div
                      class="wallet-card"
                      :class="{ selected: walletChoice === 'rename-default' }"
                      @click="walletChoice = 'rename-default'"
                    >
                      <input
                        v-model="walletChoice"
                        type="radio"
                        value="rename-default"
                        class="wallet-radio"
                        @click.stop
                      />
                      <div class="wallet-card-content">
                        <span class="wallet-card-title">{{ $t('Rename wallet') }}</span>
                        <span class="wallet-card-desc">{{ $t('Give it a custom name') }}</span>
                      </div>
                    </div>

                    <div
                      class="wallet-card"
                      :class="{ selected: walletChoice === 'create-new' }"
                      @click="walletChoice = 'create-new'"
                    >
                      <input
                        v-model="walletChoice"
                        type="radio"
                        value="create-new"
                        class="wallet-radio"
                        @click.stop
                      />
                      <div class="wallet-card-content">
                        <span class="wallet-card-title">{{ $t('Create new wallet') }}</span>
                        <span class="wallet-card-desc">{{
                          $t('Start fresh with a new wallet')
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="walletChoice === 'rename-default' || walletChoice === 'create-new'"
                    class="wallet-extra-field"
                  >
                    <label class="field-label">{{ $t('Wallet name') }}</label>
                    <input
                      v-model="newWalletName"
                      type="text"
                      :placeholder="$t('Enter wallet name')"
                      class="wallet-input"
                    />
                  </div>

                  <div v-if="walletChoice === 'create-new'" class="wallet-extra-field">
                    <label class="field-label">{{ $t('Wallet currency') }}</label>
                    <select v-model="newWalletCurrency" class="currency-select">
                      <option value="">{{ $t('Select currency') }}</option>
                      <option
                        v-for="currency in availableCurrencies"
                        :key="currency.code"
                        :value="currency.code"
                      >
                        {{ currency.code }} - {{ currency.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="currency-column">
                  <label class="column-label">{{ $t('Default currency') }}</label>
                  <select v-model="selectedCurrency" class="currency-select">
                    <option
                      v-for="currency in availableCurrencies"
                      :key="currency.code"
                      :value="currency.code"
                    >
                      {{ currency.code }} - {{ currency.name }}
                    </option>
                  </select>
                  <p class="currency-note">{{ $t('Used for displaying totals and reports.') }}</p>
                </div>
              </div>

              <div class="step-actions">
                <button
                  class="primary-btn"
                  :disabled="!isWalletCurrencySetupValid"
                  @click="handleWalletCurrencySetup"
                >
                  {{ $t('Continue') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step: Categories Setup -->
        <div v-if="currentStepId === 'categories'" class="step-content">
          <div class="step-icon">
            <IconCategory />
          </div>
          <div class="step-info">
            <h2 class="step-title">{{ $t('Set up categories') }}</h2>
            <p class="step-description">
              {{ $t('Categories help you organize and track your spending.') }}
            </p>
          </div>
          <div class="step-form">
            <div class="categories-setup">
              <div
                class="categories-card"
                :class="{ selected: wantDefaultCategories }"
                @click="wantDefaultCategories = !wantDefaultCategories"
              >
                <div class="categories-card-header">
                  <input
                    v-model="wantDefaultCategories"
                    type="checkbox"
                    class="categories-checkbox"
                    @click.stop
                  />
                  <span class="categories-card-title">{{ $t('Add default categories') }}</span>
                </div>
                <p class="categories-card-description">
                  {{
                    $t(
                      "We'll create common categories like Salary, Food & Dining, Transportation, Entertainment, and more. You can customize them later."
                    )
                  }}
                </p>
              </div>

              <div class="step-actions">
                <button class="primary-btn" @click="handleCategoriesSetup">
                  {{ $t('Continue') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step: bring transactions in (file import + any connectors) -->
        <div v-if="currentStepId === 'import'" class="step-content">
          <div class="step-icon">
            <IconImport />
          </div>
          <div class="step-info">
            <h2 class="step-title">{{ $t('Bring your transactions in') }}</h2>
            <p class="step-description">
              {{
                $t(
                  'Start with what you already have instead of typing it all in. You can always add more by hand later.'
                )
              }}
            </p>
          </div>
          <div class="step-form">
            <div class="import-options">
              <button class="import-option" @click="startFileImport">
                <span class="import-option-icon"><IconFileUpload /></span>
                <span class="import-option-text">
                  <span class="import-option-title">{{ $t('Import from a file') }}</span>
                  <span class="import-option-desc">{{
                    $t('A statement, a spreadsheet, or a photo of a receipt.')
                  }}</span>
                </span>
              </button>

              <button
                v-for="connector in connectors"
                :key="connector.key"
                class="import-option"
                @click="startConnector(connector)"
              >
                <span class="import-option-icon"><IconConnect /></span>
                <span class="import-option-text">
                  <span class="import-option-title">{{
                    connector.ui?.card?.cta || $t('Connect {name}', { name: connector.name })
                  }}</span>
                  <span class="import-option-desc">{{
                    connector.ui?.card?.description || connector.description
                  }}</span>
                </span>
              </button>
            </div>

            <div class="step-actions">
              <button class="secondary-btn" @click="nextStep">
                {{ $t("I'll add transactions myself") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step: plugin-contributed onboarding step (rendered from descriptor) -->
        <div v-else-if="currentStepContribution" class="step-content">
          <DescriptorRenderer :contribution="currentStepContribution" @next="nextStep" />
        </div>

        <!-- Step: All Set -->
        <div v-if="currentStepId === 'complete'" class="step-content completion-step">
          <div class="completion-icon">
            <CheckCircleIcon />
          </div>
          <div class="completion-info">
            <h2 class="completion-title">{{ $t("You're all set!") }}</h2>
            <p class="completion-description">
              {{
                $t(
                  "Great job! You've successfully set up your Trakli account. You're ready to start tracking your finances."
                )
              }}
            </p>
            <div class="completion-stats">
              <div class="stat-item">
                <CreditCardIcon class="stat-icon" />
                <span>{{ $t('{count} wallet', { count: walletCount }, walletCount) }}</span>
              </div>
              <div class="stat-item">
                <TagIcon class="stat-icon" />
                <span>{{ $t('{count} categories', { count: categoryCount }) }}</span>
              </div>
              <div class="stat-item">
                <ArrowsRightLeftIcon class="stat-icon" />
                <span>{{
                  $t('{count} transaction', { count: transactionCount }, transactionCount)
                }}</span>
              </div>
            </div>
          </div>
          <div class="completion-actions">
            <button class="primary-btn large" :disabled="isCompleting" @click="completeOnboarding">
              <span v-if="isCompleting" class="btn-loading-spinner" />
              {{ isCompleting ? $t('Setting up...') : $t('Go to dashboard') }}
            </button>
          </div>
        </div>
      </div>

      <div class="onboarding-footer">
        <button
          v-if="currentStep > 1 && currentStep < totalSteps"
          class="nav-btn"
          @click="previousStep"
        >
          ← {{ $t('Previous') }}
        </button>
        <div class="spacer" />
        <button v-if="currentStep < totalSteps" class="nav-btn skip" @click="skipStep">
          {{ $t('Skip for now') }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import {
  CreditCardIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  TagIcon
} from '@heroicons/vue/24/outline';
import IconLanguage from '~icons/solar/translation-bold-duotone';
import IconWallet from '~icons/solar/wallet-money-bold-duotone';
import IconCategory from '~icons/solar/widget-5-bold-duotone';
import IconImport from '~icons/solar/import-bold-duotone';
import IconFileUpload from '~icons/solar/cloud-upload-bold-duotone';
import IconConnect from '~icons/solar/link-bold-duotone';
import { useSharedData } from '@/composables/useSharedData';
import { useNotifications } from '@/composables/useNotifications';
import { useWallets } from '@/composables/useWallets';
import { useExtensionSlots } from '@/composables/useExtensionSlots';
import { useIntegrations } from '@/composables/useIntegrations';
import DescriptorRenderer from '@/components/extensions/DescriptorRenderer.vue';
import configurationsApi from '@/services/api/configurationsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import { getCountries } from '@/utils/countries';
import { CURRENCIES } from '@/utils/currencies';
import { categoriesApi } from '@/services/api/categoriesApi';

const { setLocale } = useI18n();

definePageMeta({
  layout: 'onboarding',
  middleware: 'auth'
});

const route = useRoute();
const sharedData = useSharedData();
const { showSuccess } = useNotifications();
const { createWallet, updateWallet } = useWallets();
const { setComplete: setOnboardingComplete } = useOnboardingStatus();
const returnTo = computed(() => (route.query.returnTo as string) || '/dashboard');

// Where onboarding lands when it finishes. Defaults to returnTo, but the import
// step overrides it so "import a file" or "connect an account" drop the user
// straight onto that surface instead of the dashboard.
const pendingDestination = ref<string | null>(null);
const finalDestination = computed(() => pendingDestination.value ?? returnTo.value);

const { integrations, load: loadIntegrations } = useIntegrations();
onMounted(() => {
  loadIntegrations();
});

// Connectors that can pull transactions in from a linked account (a bank, etc).
// Only ready-to-use ones: entitled, configured, and declaring a connect flow.
// File import is offered separately as the always-present built-in option.
const connectors = computed(() =>
  integrations.value.filter(
    (integration) => integration.entitled && integration.configured && integration.ui?.connect
  )
);

const startFileImport = () => {
  pendingDestination.value = '/imports';
  completeOnboarding();
};

const startConnector = (integration: (typeof integrations.value)[number]) => {
  pendingDestination.value = integration.ui?.onboarding?.href ?? '/settings';
  completeOnboarding();
};

const currentStep = ref(1);

// Onboarding is a data-driven list: built-in steps plus any plugin
// contributions to the `onboarding.steps` slot, merged by order. The
// completion step is pinned last.
const { contributionsFor } = useExtensionSlots();
const onboardingContributions = contributionsFor('onboarding.steps');

const builtInSteps = [
  { id: 'language', order: 10 },
  { id: 'wallet', order: 20 },
  { id: 'categories', order: 30 },
  { id: 'import', order: 40 },
  { id: 'complete', order: 1000 }
];

const steps = computed(() => {
  const pluginSteps = onboardingContributions.value.map((contribution) => ({
    id: contribution.key,
    order: contribution.order,
    contribution
  }));

  return [...builtInSteps, ...pluginSteps].sort((a, b) => a.order - b.order);
});

const totalSteps = computed(() => steps.value.length);
const currentStepId = computed(() => steps.value[currentStep.value - 1]?.id);
const currentStepContribution = computed(
  () => steps.value[currentStep.value - 1]?.contribution ?? null
);

const progressPercentage = computed(() => (currentStep.value / totalSteps.value) * 100);

// Data from shared state
const incomeCategories = computed(() => sharedData.getIncomeCategories?.value || []);
const expenseCategories = computed(() => sharedData.getExpenseCategories?.value || []);
const wallets = computed(() => sharedData.wallets?.value || []);
const walletCount = computed(() => wallets.value.length);
const categoryCount = computed(
  () => incomeCategories.value.length + expenseCategories.value.length
);
const transactionCount = computed(() => 0);

// Language setup
const selectedLanguage = ref('en');
const selectedCountry = ref('');
const countries = getCountries();
const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

// Wallet and currency setup
const walletChoice = ref('use-default');
const newWalletName = ref('');
const newWalletCurrency = ref('');
const selectedCurrency = ref('USD');
const wantDefaultCategories = ref(true);
const isCompleting = ref(false);

const availableCurrencies = CURRENCIES;

const isWalletCurrencySetupValid = computed(() => {
  if (!selectedCurrency.value) return false;

  if (walletChoice.value === 'rename-default') {
    return newWalletName.value.trim().length > 0;
  }

  if (walletChoice.value === 'create-new') {
    return newWalletName.value.trim().length > 0 && newWalletCurrency.value;
  }

  return true; // use-default is always valid
});

const nextStep = () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const ensureOnboardingComplete = async () => {
  const completeRes = await configurationsApi
    .create({
      key: CONFIGURATION_KEYS.ONBOARDING_COMPLETE,
      value: true,
      type: 'bool'
    })
    .catch(() => null);
  if (!completeRes) {
    await configurationsApi
      .update(CONFIGURATION_KEYS.ONBOARDING_COMPLETE, {
        value: true,
        type: 'bool'
      })
      .catch(() => null);
  }
  // Set cookie and state for fast middleware check on refresh
  setOnboardingComplete();

  // Refresh configurations cache to ensure middleware sees the update
  await sharedData.loadConfigurations(true).catch(() => null);
};

const skipStep = async () => {
  try {
    await ensureOnboardingComplete();
    await navigateTo(finalDestination.value, { replace: true });
  } catch (e) {
    console.error('Error in skipStep:', e);
  }
};

const selectLanguage = (code: string) => {
  selectedLanguage.value = code;
  setLocale(code);
};

const handleLanguageSelection = () => {
  if (!selectedLanguage.value) return;
  nextStep();
};

const handleWalletCurrencySetup = () => {
  if (!isWalletCurrencySetupValid.value) return;
  nextStep();
};

const handleCategoriesSetup = () => {
  nextStep();
};

const completeOnboarding = async () => {
  if (isCompleting.value) return;
  isCompleting.value = true;

  try {
    // Save all user selections at the end of onboarding
    const configurationsToSave = [];

    // Save language if selected
    if (selectedLanguage.value) {
      configurationsToSave.push({
        key: CONFIGURATION_KEYS.LANGUAGE,
        value: selectedLanguage.value,
        type: 'string'
      });
    }

    // Save currency if selected
    if (selectedCurrency.value) {
      configurationsToSave.push({
        key: CONFIGURATION_KEYS.CURRENCY,
        value: selectedCurrency.value,
        type: 'string'
      });
    }

    if (selectedCountry.value) {
      configurationsToSave.push({
        key: CONFIGURATION_KEYS.COUNTRY,
        value: selectedCountry.value,
        type: 'string'
      });
    }

    // Ensure a wallet exists and persist default-wallet
    let targetWalletId: string | null = null;

    if (walletChoice.value === 'use-default' || walletChoice.value === 'rename-default') {
      let existing = sharedData.getDefaultWallet.value || wallets.value[0];

      if (!existing) {
        const name =
          walletChoice.value === 'rename-default' && newWalletName.value.trim().length > 0
            ? newWalletName.value.trim()
            : 'Main Wallet';

        const createdRes = await createWallet({
          name,
          type: 'cash',
          description: 'Created during onboarding',
          currency: selectedCurrency.value
        }).catch(() => ({
          data: null
        }));
        const created = createdRes?.data as any;
        if (created) {
          existing = created;
        }
      } else if (existing) {
        const updates: Record<string, string> = {};

        if (
          walletChoice.value === 'rename-default' &&
          newWalletName.value.trim().length > 0 &&
          existing.name !== newWalletName.value.trim()
        ) {
          updates.name = newWalletName.value.trim();
        }

        if (selectedCurrency.value && existing.currency !== selectedCurrency.value) {
          updates.currency = selectedCurrency.value;
        }

        if (Object.keys(updates).length > 0) {
          await updateWallet(existing.id, updates).catch(() => null);
        }
      }

      if (existing) {
        targetWalletId = String(existing.id);
      }
    } else if (walletChoice.value === 'create-new') {
      const name = newWalletName.value.trim();

      if (name && newWalletCurrency.value) {
        const createdRes = await createWallet({
          name,
          type: 'cash',
          description: 'Created during onboarding',
          currency: newWalletCurrency.value
        }).catch(() => ({
          data: null
        }));
        const created = createdRes?.data as any;
        if (created) {
          targetWalletId = String(created.id);
        }
      }
    }

    if (targetWalletId) {
      configurationsToSave.push({
        key: CONFIGURATION_KEYS.WALLET,
        value: targetWalletId,
        type: 'string'
      });
    }

    // Save all configurations
    for (const config of configurationsToSave) {
      const createRes = await configurationsApi.create(config).catch(() => null);
      if (!createRes) {
        await configurationsApi.update(config.key, config).catch(() => null);
      }
    }

    // Create default categories if user opted in
    if (wantDefaultCategories.value) {
      await categoriesApi.seedDefaults().catch((e) => {
        console.error('Failed to seed default categories:', e);
      });
    }

    // Mark onboarding as complete
    const completeRes = await configurationsApi
      .create({
        key: CONFIGURATION_KEYS.ONBOARDING_COMPLETE,
        value: true,
        type: 'bool'
      })
      .catch(() => null);

    if (!completeRes) {
      await configurationsApi
        .update(CONFIGURATION_KEYS.ONBOARDING_COMPLETE, {
          value: true,
          type: 'bool'
        })
        .catch(() => null);
    }

    showSuccess('Welcome to Trakli!', "You're ready to take control of your finances!");

    // Always proceed with navigation
    localStorage.setItem('onboarding-completed', 'true');
    localStorage.removeItem('onboarding-step');
    // Refresh caches so default wallet/currency reflect immediately after onboarding
    await Promise.all([
      sharedData.loadConfigurations(true).catch(() => {}),
      sharedData.loadWallets(true).catch(() => {})
    ]);
    await navigateTo(finalDestination.value, { replace: true });
  } finally {
    isCompleting.value = false;
  }
};

onMounted(() => {
  const savedStep = localStorage.getItem('onboarding-step');
  if (savedStep) {
    currentStep.value = Number.parseInt(savedStep) + 1;
    localStorage.removeItem('onboarding-step');
  }

  sharedData.loadCategories();
  sharedData.loadWallets();
});

onBeforeRouteLeave(() => {
  // Mark onboarding complete synchronously to avoid layout transition issues
  if (typeof globalThis !== 'undefined') {
    const completed = globalThis.localStorage.getItem('onboarding-completed') === 'true';
    if (!completed) {
      globalThis.localStorage.setItem('onboarding-completed', 'true');
      // Fire and forget - don't await to avoid blocking navigation
      ensureOnboardingComplete().catch(() => {});
    }
  }
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_onboarding' as *;
@use '~/assets/scss/_variables' as *;

.country-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1.25rem;
  text-align: left;
}

.country-label {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
}

.country-select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  padding: 0.7rem 0.85rem;
  font-size: $font-size-base;
  font-family: inherit;
  color: $text-primary;
  background: $bg-white;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}
</style>
