<template>
  <div class="onboarding-empty-state">
    <div class="onboarding-content">
      <div class="onboarding-icon">
        <component :is="iconComponent" class="main-icon" />
      </div>

      <div class="onboarding-text">
        <h2 class="onboarding-title">{{ config.title }}</h2>
        <p class="onboarding-subtitle">{{ config.subtitle }}</p>

        <div v-if="config.steps" class="onboarding-steps">
          <div class="steps-header">
            <span class="steps-label">Quick Start:</span>
          </div>
          <ol class="steps-list">
            <li v-for="(step, index) in config.steps" :key="index" class="step-item">
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </li>
          </ol>
        </div>
      </div>

      <div class="onboarding-actions">
        <button class="primary-action-btn" @click="$emit('create')">
          <PlusIcon class="button-icon" />
          {{ config.primaryAction }}
        </button>
      </div>

      <div v-if="config.tip" class="onboarding-tip">
        <div class="tip-icon">
          <LightBulbIcon />
        </div>
        <span class="tip-text">{{ config.tip }}</span>
      </div>
    </div>
  </div>
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
  FolderIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  pageType: {
    type: String,
    required: true,
    validator: (value) =>
      ['wallets', 'categories', 'transactions', 'parties', 'groups'].includes(value)
  }
});

defineEmits(['create', 'secondary-action']);

const iconComponents = {
  wallets: CreditCardIcon,
  categories: TagIcon,
  transactions: ArrowsRightLeftIcon,
  parties: UsersIcon,
  groups: FolderIcon
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
    tip: '💡 Start with your main bank account - you can add more wallets later!'
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
    tip: "💡 Don't worry about getting it perfect - you can always add more categories later!"
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
    tip: '💡 Pro tip: Start by adding your most recent transactions to get into the habit!'
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
    tip: '💡 Start with your most frequent payees - your employer, grocery store, or landlord!'
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
    tip: '💡 Think of groups as project folders for your money - perfect for tracking specific goals!'
  }
};

const iconComponent = computed(() => iconComponents[props.pageType]);
const config = computed(() => onboardingConfigs[props.pageType]);
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.onboarding-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.75rem 2rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: $breakpoint-md) {
    padding: 0.5rem 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem 1rem;
  }
}

.onboarding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.onboarding-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, $primary-light 0%, rgba(4, 120, 68, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -6px;
    background: linear-gradient(135deg, $primary 0%, rgba(4, 120, 68, 0.6) 100%);
    border-radius: 50%;
    opacity: 0.1;
    z-index: -1;
  }

  .main-icon {
    width: 32px;
    height: 32px;
    color: $primary;
    stroke-width: 1.5;
  }

  @media (max-width: $breakpoint-md) {
    width: 70px;
    height: 70px;

    .main-icon {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: $breakpoint-sm) {
    width: 60px;
    height: 60px;

    .main-icon {
      width: 24px;
      height: 24px;
    }
  }
}

.onboarding-text {
  max-width: 600px;
}

.onboarding-title {
  color: $text-primary;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;

  @media (max-width: $breakpoint-md) {
    font-size: 1.875rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.5rem;
  }
}

.onboarding-subtitle {
  color: $text-secondary;
  font-size: 1.125rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;

  @media (max-width: $breakpoint-md) {
    font-size: 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.9rem;
  }
}

.onboarding-steps {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: left;

  @media (max-width: $breakpoint-sm) {
    padding: 1rem;
  }
}

.steps-header {
  margin-bottom: 1rem;
}

.steps-label {
  font-weight: 600;
  color: $primary;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: $text-primary;
  line-height: 1.4;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.85rem;
  }
}

.step-number {
  background: $primary;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 1px;
}

.step-text {
  flex: 1;
  padding-top: 2px;
}

.onboarding-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.primary-action-btn {
  background: $primary;
  color: #fff;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(4, 120, 68, 0.3);

  .button-icon {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  &:hover {
    background: $primary-hover;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(4, 120, 68, 0.4);
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
    min-width: 180px;
  }
}

.onboarding-tip {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 500px;
  text-align: left;

  @media (max-width: $breakpoint-sm) {
    padding: 0.875rem 1rem;
    text-align: center;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}

.tip-icon {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 1px;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.tip-text {
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.8rem;
  }
}
</style>
