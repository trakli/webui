<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <div class="onboarding-header">
        <div class="welcome-section">
          <h1 class="main-title">Welcome to Trakli!</h1>
          <p class="subtitle">Let's set up your account in just a few steps</p>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }" />
          </div>
          <span class="progress-text">Step {{ currentStep }} of {{ totalSteps }}</span>
        </div>
      </div>

      <div class="onboarding-content">
        <!-- Step 1: Language Selection -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-icon">
            <svg
              class="language-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="step-info">
            <h2 class="step-title">Choose your language</h2>
            <p class="step-description">
              Select your preferred language for Trakli. You can change this later in settings.
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
                  @click="selectedLanguage = language.code"
                >
                  <span class="language-flag">{{ language.flag }}</span>
                  <span class="language-name">{{ language.name }}</span>
                </button>
              </div>

              <div class="step-actions">
                <button
                  class="primary-btn"
                  :disabled="!selectedLanguage"
                  @click="handleLanguageSelection"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Wallet and Currency Setup -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-icon">
            <CreditCardIcon />
          </div>
          <div class="step-info">
            <h2 class="step-title">Set up your wallet</h2>
            <p class="step-description">
              Configure your default wallet and currency for tracking transactions.
            </p>
          </div>
          <div class="step-form">
            <div class="wallet-currency-setup">
              <div class="wallet-currency-columns">
                <div class="wallet-column">
                  <label class="column-label">Default wallet</label>
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
                        <span class="wallet-card-title">Use Main Wallet</span>
                        <span class="wallet-card-desc">Keep the default wallet name</span>
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
                        <span class="wallet-card-title">Rename wallet</span>
                        <span class="wallet-card-desc">Give it a custom name</span>
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
                        <span class="wallet-card-title">Create new wallet</span>
                        <span class="wallet-card-desc">Start fresh with a new wallet</span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="walletChoice === 'rename-default' || walletChoice === 'create-new'"
                    class="wallet-extra-field"
                  >
                    <label class="field-label">Wallet name</label>
                    <input
                      v-model="newWalletName"
                      type="text"
                      placeholder="Enter wallet name"
                      class="wallet-input"
                    />
                  </div>

                  <div v-if="walletChoice === 'create-new'" class="wallet-extra-field">
                    <label class="field-label">Wallet currency</label>
                    <select v-model="newWalletCurrency" class="currency-select">
                      <option value="">Select currency</option>
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
                  <label class="column-label">Default currency</label>
                  <select v-model="selectedCurrency" class="currency-select">
                    <option
                      v-for="currency in availableCurrencies"
                      :key="currency.code"
                      :value="currency.code"
                    >
                      {{ currency.code }} - {{ currency.name }}
                    </option>
                  </select>
                  <p class="currency-note">Used for displaying totals and reports.</p>
                </div>
              </div>

              <div class="step-actions">
                <button
                  class="primary-btn"
                  :disabled="!isWalletCurrencySetupValid"
                  @click="handleWalletCurrencySetup"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Categories Setup -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="step-icon">
            <TagIcon />
          </div>
          <div class="step-info">
            <h2 class="step-title">Set up categories</h2>
            <p class="step-description">Categories help you organize and track your spending.</p>
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
                  <span class="categories-card-title">Add default categories</span>
                </div>
                <p class="categories-card-description">
                  We'll create common categories like Salary, Food & Dining, Transportation,
                  Entertainment, and more. You can customize them later.
                </p>
              </div>

              <div class="step-actions">
                <button class="primary-btn" @click="handleCategoriesSetup">Continue</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: All Set -->
        <div v-if="currentStep === 4" class="step-content completion-step">
          <div class="completion-icon">
            <CheckCircleIcon />
          </div>
          <div class="completion-info">
            <h2 class="completion-title">🎉 You're all set!</h2>
            <p class="completion-description">
              Great job! You've successfully set up your Trakli account. You're ready to start
              tracking your finances.
            </p>
            <div class="completion-stats">
              <div class="stat-item">
                <CreditCardIcon class="stat-icon" />
                <span>{{ walletCount }} wallet{{ walletCount !== 1 ? 's' : '' }}</span>
              </div>
              <div class="stat-item">
                <TagIcon class="stat-icon" />
                <span>{{ categoryCount }} categories</span>
              </div>
              <div class="stat-item">
                <ArrowsRightLeftIcon class="stat-icon" />
                <span
                  >{{ transactionCount }} transaction{{ transactionCount !== 1 ? 's' : '' }}</span
                >
              </div>
            </div>
          </div>
          <div class="completion-actions">
            <button class="primary-btn large" @click="completOnboarding">Go to dashboard</button>
          </div>
        </div>
      </div>

      <div class="onboarding-footer">
        <button
          v-if="currentStep > 1 && currentStep < totalSteps"
          class="nav-btn"
          @click="previousStep"
        >
          ← Previous
        </button>
        <div class="spacer" />
        <button v-if="currentStep < totalSteps" class="nav-btn skip" @click="skipStep">
          Skip for now →
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
import { useSharedData } from '@/composables/useSharedData';
import { useNotifications } from '@/composables/useNotifications';
import { useWallets } from '@/composables/useWallets';
import configurationsApi from '@/services/api/configurationsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import { CURRENCIES } from '@/utils/currencies';
import { categoriesApi } from '@/services/api/categoriesApi';

definePageMeta({
  layout: 'onboarding',
  middleware: 'auth'
});

const sharedData = useSharedData();
const { showSuccess } = useNotifications();
const { createWallet, updateWallet } = useWallets();

const currentStep = ref(1);
const totalSteps = 4;

const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100);

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
  if (currentStep.value < totalSteps) {
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
      value: { completedAt: new Date().toISOString() },
      type: 'json'
    })
    .catch(() => null);
  if (!completeRes) {
    await configurationsApi
      .update(CONFIGURATION_KEYS.ONBOARDING_COMPLETE, {
        value: { completedAt: new Date().toISOString() },
        type: 'json'
      })
      .catch(() => null);
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.localStorage.setItem('onboarding-completed', 'true');
  }

  // Refresh configurations cache to ensure middleware sees the update
  await sharedData.loadConfigurations(true).catch(() => null);
};

const skipStep = async () => {
  try {
    await ensureOnboardingComplete();
    await navigateTo('/dashboard', { replace: true });
  } catch (e) {
    console.error('Error in skipStep:', e);
  }
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

const completOnboarding = async () => {
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
    } else if (
      walletChoice.value === 'rename-default' &&
      newWalletName.value.trim().length > 0 &&
      existing.name !== newWalletName.value.trim()
    ) {
      await updateWallet(existing.id, { name: newWalletName.value.trim() }).catch(() => null);
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
      value: { completedAt: new Date().toISOString() },
      type: 'json'
    })
    .catch(() => null);

  if (!completeRes) {
    await configurationsApi
      .update(CONFIGURATION_KEYS.ONBOARDING_COMPLETE, {
        value: { completedAt: new Date().toISOString() },
        type: 'json'
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
  await navigateTo('/dashboard', { replace: true });
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
</style>
