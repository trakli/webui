<template>
  <div class="dashboard-onboarding">
    <div class="onboarding-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <ArrowsRightLeftIcon class="main-icon" />
        </div>
        <h2 class="hero-title">Welcome to Your Financial Dashboard!</h2>
        <p class="hero-subtitle">
          We've created some starter items for you, but let's personalize them and add your real
          financial data to get the most out of Trakli.
        </p>
      </div>
    </div>

    <div class="onboarding-cards">
      <div
        v-for="(step, index) in onboardingSteps"
        :key="step.key"
        class="onboarding-card"
        :class="{
          'card-completed': step.completed,
          'card-current': !step.completed && index === currentStep
        }"
      >
        <div class="card-header">
          <div class="step-indicator">
            <CheckIcon v-if="step.completed" class="check-icon" />
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="card-title-area">
            <h3 class="card-title">{{ step.title }}</h3>
            <p class="card-description">{{ step.description }}</p>
          </div>
        </div>

        <div class="card-actions">
          <button
            v-if="!step.completed"
            class="action-btn"
            :class="{
              'btn-primary': index === currentStep,
              'btn-secondary': index !== currentStep
            }"
            @click="$emit('navigate', step.route)"
          >
            <component :is="step.icon" class="btn-icon" />
            {{ step.action }}
          </button>
          <div v-else class="completion-indicator">
            <CheckCircleIcon class="completion-icon" />
            <span class="completion-text">Completed</span>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-tips">
      <div class="tips-header">
        <LightBulbIcon class="tips-icon" />
        <span class="tips-title">Quick Tips</span>
      </div>
      <ul class="tips-list">
        <li>Customize your default wallet with your real bank account name and balance</li>
        <li>
          We've added basic categories - add personal ones like "Coffee", "Gym", "Netflix", "Uber"
        </li>
        <li>Start with your most recent transactions to see your money flow instantly</li>
        <li>Add parties (employer, grocery store, etc.) for detailed spending patterns</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  ArrowsRightLeftIcon,
  CreditCardIcon,
  TagIcon,
  UsersIcon,
  CheckIcon,
  CheckCircleIcon,
  LightBulbIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  hasWallets: {
    type: Boolean,
    default: false
  },
  hasCategories: {
    type: Boolean,
    default: false
  },
  hasTransactions: {
    type: Boolean,
    default: false
  },
  hasParties: {
    type: Boolean,
    default: false
  }
});

defineEmits(['navigate']);

const onboardingSteps = computed(() => [
  {
    key: 'wallets',
    title: 'Personalize Your Wallet',
    description:
      'We created a default wallet for you. Update it with your real bank account or cash details',
    action: 'Setup Wallets',
    route: '/wallets',
    icon: CreditCardIcon,
    completed: false // Always encourage customization
  },
  {
    key: 'categories',
    title: 'Review & Expand Categories',
    description:
      'Basic categories are ready! Add specific ones for your lifestyle (gym, coffee, etc.)',
    action: 'Manage Categories',
    route: '/categories',
    icon: TagIcon,
    completed: false // Always encourage review and expansion
  },
  {
    key: 'transactions',
    title: 'Add Your First Real Transaction',
    description: 'This is where the magic happens! Add actual income or expenses to start tracking',
    action: 'Add Transaction',
    route: '/transactions/new',
    icon: PlusIcon,
    completed: props.hasTransactions
  },
  {
    key: 'parties',
    title: 'Track Who You Deal With',
    description: 'Add your employer, favorite stores, or anyone you exchange money with regularly',
    action: 'Add Parties',
    route: '/parties',
    icon: UsersIcon,
    completed: false // Encourage adding real parties
  }
]);

const currentStep = computed(() => {
  const incompleteIndex = onboardingSteps.value.findIndex((step) => !step.completed);
  return incompleteIndex === -1 ? onboardingSteps.value.length - 1 : incompleteIndex;
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.dashboard-onboarding {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: $breakpoint-md) {
    padding: 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 1rem;
  }
}

.onboarding-hero {
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: $breakpoint-md) {
    margin-bottom: 2rem;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, $primary-light 0%, rgba(var(--color-primary-rgb), 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;

  .main-icon {
    width: 36px;
    height: 36px;
    color: $primary;
    stroke-width: 1.5;
  }

  @media (max-width: $breakpoint-sm) {
    width: 64px;
    height: 64px;

    .main-icon {
      width: 28px;
      height: 28px;
    }
  }
}

.hero-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  line-height: 1.2;

  @media (max-width: $breakpoint-md) {
    font-size: 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.25rem;
  }
}

.hero-subtitle {
  font-size: 1.1rem;
  color: $text-secondary;
  margin: 0;
  line-height: 1.5;
  max-width: 500px;

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
  }
}

.onboarding-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: $breakpoint-md) {
    margin-bottom: 2rem;
  }
}

.onboarding-card {
  background: $bg-white;
  border: 2px solid $border-color;
  border-radius: $radius-xl;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;

  &.card-completed {
    background: rgba(var(--color-success-rgb), 0.1);
    border-color: $primary;

    .step-indicator {
      background: $primary;
      color: $bg-white;
    }
  }

  &.card-current {
    border-color: $primary;
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.15);
    transform: scale(1.02);
  }

  @media (max-width: $breakpoint-sm) {
    padding: 1.25rem;
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: $breakpoint-sm) {
    margin-bottom: 1rem;
  }
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $bg-light;
  color: $text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all 0.3s ease;

  .check-icon {
    width: 20px;
    height: 20px;
  }

  @media (max-width: $breakpoint-sm) {
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}

.card-title-area {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
  }
}

.card-description {
  font-size: 0.9rem;
  color: $text-secondary;
  margin: 0;
  line-height: 1.4;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.85rem;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: $radius-lg;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  .btn-icon {
    width: 1rem;
    height: 1rem;
  }

  &.btn-primary {
    background: $primary;
    color: white;

    &:hover {
      background: $primary-hover;
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background: $bg-light;
    color: $text-secondary;
    border: 1px solid $border-light;

    &:hover {
      background: $bg-white;
      color: $primary;
      border-color: $primary;
    }
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
}

.completion-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $primary;
  font-weight: 500;
  font-size: 0.9rem;

  .completion-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.85rem;
  }
}

.quick-tips {
  background: rgba(var(--color-warning-rgb), 0.15);
  border: 1px solid $warning;
  border-radius: $radius-xl;
  padding: 1.5rem;

  @media (max-width: $breakpoint-sm) {
    padding: 1.25rem;
  }
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .tips-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: $warning;
  }

  .tips-title {
    font-weight: 600;
    color: $warning;
    font-size: 0.95rem;
  }
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    color: $warning;
    font-size: 0.875rem;
    line-height: 1.4;
    position: relative;
    padding-left: 1.25rem;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: $warning;
      font-weight: bold;
    }

    @media (max-width: $breakpoint-sm) {
      font-size: 0.8rem;
    }
  }
}
</style>
