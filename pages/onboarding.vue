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
            <h2 class="step-title">Set up your wallet and currency</h2>
            <p class="step-description">
              Configure your default wallet and currency. Your wallet currency and default currency
              should match for accurate tracking.
            </p>
          </div>
          <div class="step-form">
            <div class="wallet-currency-setup">
              <div class="setup-warning">
                <div class="warning-icon">💡</div>
                <p class="warning-text">
                  We've created a default wallet for you. You can use it, rename it, or create a new
                  one.
                </p>
              </div>

              <div class="setup-sections">
                <div class="setup-section">
                  <h3>Wallet setup</h3>
                  <div class="wallet-options">
                    <div class="wallet-option">
                      <input
                        id="use-default"
                        v-model="walletChoice"
                        type="radio"
                        value="use-default"
                      />
                      <label for="use-default">Use default wallet</label>
                    </div>
                    <div class="wallet-option">
                      <input
                        id="rename-default"
                        v-model="walletChoice"
                        type="radio"
                        value="rename-default"
                      />
                      <label for="rename-default">Rename default wallet</label>
                    </div>
                    <div class="wallet-option">
                      <input
                        id="create-new"
                        v-model="walletChoice"
                        type="radio"
                        value="create-new"
                      />
                      <label for="create-new">Create new wallet</label>
                    </div>
                  </div>

                  <div v-if="walletChoice === 'rename-default'" class="wallet-name-input">
                    <input
                      v-model="newWalletName"
                      type="text"
                      placeholder="Enter wallet name"
                      class="wallet-input"
                    />
                  </div>

                  <div v-if="walletChoice === 'create-new'" class="new-wallet-form">
                    <input
                      v-model="newWalletName"
                      type="text"
                      placeholder="Wallet name"
                      class="wallet-input"
                    />
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

                <div class="setup-section">
                  <h3>Default currency</h3>
                  <select v-model="selectedCurrency" class="currency-select">
                    <option
                      v-for="currency in availableCurrencies"
                      :key="currency.code"
                      :value="currency.code"
                    >
                      {{ currency.code }} - {{ currency.name }}
                    </option>
                  </select>
                  <p class="currency-note">
                    This will be your default currency for all transactions.
                  </p>
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

        <!-- Step 3: All Set -->
        <div v-if="currentStep === 3" class="step-content completion-step">
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
        <button v-if="currentStep > 1 && currentStep < 4" class="nav-btn" @click="previousStep">
          ← Previous
        </button>
        <div class="spacer" />
        <button v-if="currentStep < 3" class="nav-btn skip" @click="skipStep">
          Skip for now →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'nuxt/app';
import { CreditCardIcon, ArrowsRightLeftIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';
import { useSharedData } from '@/composables/useSharedData';
import { useNotifications } from '@/composables/useNotifications';

definePageMeta({
  layout: 'onboarding',
  middleware: 'auth'
});

const router = useRouter();
const sharedData = useSharedData();
const { showSuccess } = useNotifications();

const currentStep = ref(1);
const totalSteps = 3;

const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100);

// Data from shared state
const incomeCategories = computed(() => sharedData.getIncomeCategories?.value || []);
const expenseCategories = computed(() => sharedData.getExpenseCategories?.value || []);
const wallets = computed(() => sharedData.getWallets?.value || []);
const walletCount = computed(() => wallets.value.length);
const categoryCount = computed(
  () => incomeCategories.value.length + expenseCategories.value.length
);
const transactionCount = computed(() => sharedData.getTransactions?.value?.length || 0);

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

const availableCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' }
];

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

const skipStep = () => {
  nextStep();
};

const handleLanguageSelection = () => {
  if (!selectedLanguage.value) return;

  showSuccess(
    'Language Set!',
    `Language changed to ${availableLanguages.find((l) => l.code === selectedLanguage.value)?.name}.`
  );
  nextStep();
};

const handleWalletCurrencySetup = () => {
  if (!isWalletCurrencySetupValid.value) return;

  let message = 'Settings saved successfully!';

  if (walletChoice.value === 'rename-default') {
    message = `Default wallet renamed to "${newWalletName.value}" and currency set to ${selectedCurrency.value}.`;
  } else if (walletChoice.value === 'create-new') {
    message = `New wallet "${newWalletName.value}" created with ${newWalletCurrency.value} currency.`;
  } else {
    message = `Default wallet configured with ${selectedCurrency.value} currency.`;
  }

  showSuccess('Setup Complete!', message);
  nextStep();
};

const completOnboarding = () => {
  localStorage.setItem('onboarding-completed', 'true');
  localStorage.removeItem('onboarding-step');
  showSuccess('Welcome to Trakli!', "You're ready to take control of your finances!");
  router.push('/dashboard');
};

onMounted(() => {
  const savedStep = localStorage.getItem('onboarding-step');
  if (savedStep) {
    currentStep.value = parseInt(savedStep) + 1;
    localStorage.removeItem('onboarding-step');
  }

  sharedData.loadCategories();
  sharedData.loadWallets();
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_onboarding' as *;
</style>
