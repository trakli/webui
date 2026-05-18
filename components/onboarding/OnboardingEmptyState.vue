<template>
  <section class="onboarding-empty-state surface surface--brand-soft">
    <svg
      class="oe-backdrop"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="oe-backdrop-bloom" cx="100%" cy="30%" r="60%">
          <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1100" cy="100" r="280" fill="url(#oe-backdrop-bloom)" />
    </svg>

    <div class="oe-grid">
      <div class="oe-art">
        <div class="illustration-wrap">
          <svg class="illustration" viewBox="0 0 220 220" aria-hidden="true">
            <defs>
              <radialGradient id="oe-glow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.4" />
                <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle cx="110" cy="110" r="100" fill="url(#oe-glow)" />
            <circle
              cx="110"
              cy="110"
              r="82"
              fill="none"
              stroke="var(--surface-accent)"
              stroke-opacity="0.5"
              stroke-width="1"
              stroke-dasharray="3 4"
            />
            <circle
              cx="110"
              cy="110"
              r="58"
              fill="none"
              stroke="var(--surface-accent)"
              stroke-opacity="0.65"
              stroke-width="1"
            />
            <circle cx="110" cy="110" r="42" fill="var(--surface-accent)" />
            <circle cx="195" cy="58" r="6" fill="var(--surface-accent)" opacity="0.9" />
            <circle cx="36" cy="170" r="4" fill="var(--surface-accent)" opacity="0.75" />
            <circle cx="172" cy="180" r="5" fill="var(--surface-accent)" opacity="0.65" />
          </svg>
          <div class="illustration-icon">
            <component :is="iconComponent" class="main-icon" />
          </div>
        </div>
      </div>

      <div class="oe-content">
        <span class="oe-eyebrow">{{ t('Getting started') }}</span>
        <h2 class="onboarding-title">{{ t(config.title) }}</h2>
        <p class="onboarding-subtitle">{{ t(config.subtitle) }}</p>

        <div v-if="config.steps" class="onboarding-steps">
          <ol class="steps-list">
            <li v-for="(step, index) in config.steps" :key="index" class="step-item">
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ t(step) }}</span>
            </li>
          </ol>
        </div>

        <div class="onboarding-actions">
          <button class="primary-action-btn" @click="$emit('create')">
            <PlusIcon class="button-icon" />
            {{ t(config.primaryAction) }}
          </button>
          <div v-if="config.tip" class="onboarding-tip">
            <div class="tip-icon">
              <LightBulbIcon />
            </div>
            <span class="tip-text">{{ t(config.tip) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import {
  PlusIcon,
  LightBulbIcon,
  CreditCardIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  UsersIcon,
  FolderIcon,
  ChartPieIcon,
  BellAlertIcon
} from '@heroicons/vue/24/outline';

const { t } = useI18n();

const props = defineProps({
  pageType: {
    type: String,
    required: true,
    validator: (value) =>
      [
        'wallets',
        'categories',
        'transactions',
        'parties',
        'groups',
        'budgets',
        'reminders'
      ].includes(value)
  }
});

defineEmits(['create', 'secondary-action']);

const iconComponents = {
  wallets: CreditCardIcon,
  categories: TagIcon,
  transactions: ArrowsRightLeftIcon,
  parties: UsersIcon,
  groups: FolderIcon,
  budgets: ChartPieIcon,
  reminders: BellAlertIcon
};

const onboardingConfigs = {
  wallets: {
    title: "Let's Set Up Your First Wallet",
    subtitle:
      'Wallets help you organize your money across different accounts like bank accounts, cash, or digital wallets.',
    steps: [
      "Create your first wallet (e.g., 'Main Bank Account')",
      'Add your current balance',
      'Start tracking transactions'
    ],
    primaryAction: 'Add First Wallet',
    tip: 'Start with your main bank account - you can add more wallets later!'
  },
  categories: {
    title: 'Organize Your Money with Categories',
    subtitle:
      "Categories help you understand where your money comes from and where it goes. We'll start with some basics!",
    steps: [
      "Create income categories (e.g., 'Salary', 'Freelance')",
      "Add expense categories (e.g., 'Food', 'Transport')",
      'Use them when adding transactions'
    ],
    primaryAction: 'Add First Category',
    tip: "Don't worry about getting it perfect - you can always add more categories later!"
  },
  transactions: {
    title: 'Ready to Track Your First Transaction?',
    subtitle:
      "Transactions are the heart of expense tracking. Each transaction tells the story of your money's journey.",
    steps: [
      "Click 'Add Transaction' above",
      'Choose income or expense',
      'Select wallet and category',
      'Add amount and description'
    ],
    primaryAction: 'Add First Transaction',
    tip: 'Pro tip: Start by adding your most recent transactions to get into the habit!'
  },
  parties: {
    title: 'Track Who You Deal With',
    subtitle:
      'Parties are people or businesses you exchange money with. This helps you see spending patterns with specific vendors.',
    steps: [
      "Add common payees (e.g., 'Grocery Store', 'Landlord')",
      "Include income sources (e.g., 'Employer', 'Client Name')",
      'Use them in transactions for better insights'
    ],
    primaryAction: 'Add First Party',
    tip: 'Start with your most frequent payees - your employer, grocery store, or landlord!'
  },
  groups: {
    title: 'Organize with Smart Groups',
    subtitle:
      'Groups help you organize transactions by purpose, project, or any custom criteria that matters to you.',
    steps: [
      "Create groups for specific purposes (e.g., 'Vacation', 'Home Improvement')",
      'Add relevant transactions to groups',
      'Track group budgets and spending'
    ],
    primaryAction: 'Add First Group',
    tip: 'Think of groups as project folders for your money - perfect for tracking specific goals!'
  },
  budgets: {
    title: 'Take Control of Your Spending',
    subtitle:
      "Budgets put a cap on what you spend in a category, group, or wallet — and tell you when you're drifting off track before the month is over.",
    steps: [
      'Pick what to budget — a category, group, or even a specific wallet',
      'Set an amount and period (weekly, monthly, yearly, or a custom range)',
      'Choose whether unused amounts roll over to the next period',
      "Get alerts as you approach the limit, and forecast warnings when you're on pace to breach"
    ],
    primaryAction: 'Create First Budget'
  },
  reminders: {
    title: 'Never miss a money moment',
    subtitle:
      'Reminders nudge you when bills are due, paydays land, or recurring transactions need attention. Nothing slips through the cracks.',
    steps: [
      'Pick a title and date (or set up a repeating rule)',
      'Choose how you want to be notified',
      'Mark reminders done or pause them as life changes'
    ],
    primaryAction: 'Create your first reminder'
  }
};

const iconComponent = computed(() => iconComponents[props.pageType]);
const config = computed(() => onboardingConfigs[props.pageType]);
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.onboarding-empty-state {
  position: relative;
  width: 100%;
  border: 1px solid $border-light;
  border-radius: 18px;
  box-shadow: $elevation-1;
  overflow: hidden;
  padding: 2rem 2.25rem;

  @media (max-width: $breakpoint-md) {
    padding: 1.5rem 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 1.25rem 1rem;
    border-radius: 14px;
  }
}

.oe-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.oe-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-5;
  align-items: center;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: minmax(0, 4fr) minmax(0, 6fr);
    gap: $spacing-8;
  }
}

.oe-art {
  display: flex;
  align-items: center;
  justify-content: center;
}

.oe-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  gap: 8px;

  @media (max-width: $breakpoint-md) {
    align-items: center;
    text-align: center;
  }
}

.oe-eyebrow {
  font-size: 11px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--surface-deep);
  opacity: 0.85;
  margin-bottom: 2px;
}

.illustration-wrap {
  position: relative;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: $breakpoint-md) {
    width: 180px;
    height: 180px;
  }

  @media (max-width: $breakpoint-sm) {
    width: 150px;
    height: 150px;
  }
}

.illustration {
  width: 100%;
  height: 100%;
  animation: oe-float 6s $easing-standard infinite;
}

@keyframes oe-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.illustration-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .main-icon {
    width: 36px;
    height: 36px;
    color: var(--color-text-inverse);
    stroke-width: 1.8;

    @media (max-width: $breakpoint-md) {
      width: 30px;
      height: 30px;
    }
  }
}

.onboarding-title {
  color: var(--surface-ink);
  font-size: 1.75rem;
  font-weight: $font-bold;
  letter-spacing: -0.025em;
  margin: 0 0 0.375rem 0;
  line-height: 1.1;

  @media (max-width: $breakpoint-md) {
    font-size: 1.4rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.25rem;
  }
}

.onboarding-subtitle {
  color: var(--surface-ink);
  opacity: 0.75;
  font-size: $font-size-base;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  max-width: 48ch;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.onboarding-steps {
  background: var(--glass-bg);
  border: 1px solid $border-light;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  margin: 0.25rem 0 1rem;
  text-align: left;
  width: 100%;
  max-width: 520px;
  backdrop-filter: blur(6px);

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem 0.875rem;
  }
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: $font-size-sm;
  color: $text-primary;
  line-height: 1.4;
}

.step-number {
  background: var(--surface-deep);
  color: var(--surface-bg);
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: $font-bold;
  flex-shrink: 0;
  margin-top: 1px;
  font-variant-numeric: tabular-nums;
}

.step-text {
  flex: 1;
}

.onboarding-actions {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-md) {
    justify-content: center;
  }
}

.primary-action-btn {
  background: $primary;
  color: $bg-white;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  letter-spacing: -0.005em;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  transition:
    background-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard,
    transform $duration-fast $easing-standard;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  box-shadow: $elevation-1;

  .button-icon {
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }

  &:hover {
    background: $primary-hover;
    box-shadow: $elevation-2;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.onboarding-tip {
  background: var(--glass-bg);
  border: 1px solid $border-light;
  border-radius: 999px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  backdrop-filter: blur(6px);
}

.tip-icon {
  color: var(--surface-deep);
  flex-shrink: 0;
  display: inline-flex;

  svg {
    width: 12px;
    height: 12px;
  }
}

.tip-text {
  color: var(--surface-ink);
  opacity: 0.8;
  font-size: 11px;
  font-weight: $font-medium;
  line-height: 1.4;
  margin: 0;
  text-align: left;
}
</style>
