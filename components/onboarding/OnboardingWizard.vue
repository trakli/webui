<template>
  <div class="onboarding-wizard">
    <div class="wizard-header">
      <h2 class="wizard-title">{{ currentStep.title }}</h2>
      <div class="step-indicators">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-indicator"
          :class="{ active: index === currentStepIndex, completed: index < currentStepIndex }"
        />
      </div>
    </div>

    <div class="steps-container">
      <div class="steps-track" :style="{ transform: `translateX(-${currentStepIndex * 100}%)` }">
        <div v-for="(step, index) in steps" :key="index" class="step-slide">
          <div class="step-content">
            <div class="step-icon">
              <component :is="step.icon" class="icon" />
            </div>

            <div class="step-text">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>

              <div class="step-benefits">
                <h4 class="benefits-title">Why this matters:</h4>
                <div class="benefits-grid">
                  <div v-for="benefit in step.benefits" :key="benefit.text" class="benefit-item">
                    <span class="benefit-icon">{{ benefit.icon }}</span>
                    <span class="benefit-text">{{ benefit.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button
              v-if="index === 0"
              class="primary-btn"
              @click="$emit('start-action', step.action)"
            >
              {{ step.buttonText }}
            </button>
            <button
              v-else-if="index === steps.length - 1"
              class="primary-btn"
              @click="$emit('complete-onboarding')"
            >
              Start Using Trakli
            </button>
            <button v-else class="primary-btn" @click="$emit('step-action', step.action)">
              {{ step.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="navigation-controls">
      <button class="nav-btn prev-btn" :disabled="currentStepIndex === 0" @click="previousStep">
        <ChevronLeftIcon class="nav-icon" />
        Previous
      </button>

      <div class="step-counter">{{ currentStepIndex + 1 }} of {{ steps.length }}</div>

      <button
        class="nav-btn next-btn"
        :disabled="currentStepIndex === steps.length - 1"
        @click="nextStep"
      >
        Next
        <ChevronRightIcon class="nav-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  ArrowsRightLeftIcon,
  CreditCardIcon,
  TagIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';

defineEmits(['start-action', 'step-action', 'complete-onboarding']);

const currentStepIndex = ref(0);

const steps = [
  {
    title: 'Add your first transaction',
    description:
      'Start your financial journey by recording a transaction. This is the heart of expense tracking!',
    icon: PlusIcon,
    buttonText: 'Add transaction',
    action: 'add-transaction',
    benefits: [
      { icon: '💰', text: 'See your balance change in real-time' },
      { icon: '📊', text: 'Get instant insights into your spending' },
      { icon: '🎯', text: 'Start building healthy money habits' }
    ]
  },
  {
    title: 'Understand wallets',
    description:
      'Wallets represent your money sources - bank accounts, cash, credit cards, or digital wallets.',
    icon: CreditCardIcon,
    buttonText: 'Setup wallets',
    action: 'setup-wallets',
    benefits: [
      { icon: '🏦', text: 'Track all your accounts in one place' },
      { icon: '💳', text: 'See which payment method you use most' },
      { icon: '📈', text: 'Monitor your total net worth' }
    ]
  },
  {
    title: 'Organize with categories',
    description:
      'Categories help you understand spending patterns by grouping similar transactions together.',
    icon: TagIcon,
    buttonText: 'Manage categories',
    action: 'manage-categories',
    benefits: [
      { icon: '🏷️', text: 'Identify your biggest spending areas' },
      { icon: '📋', text: 'Create budgets for specific categories' },
      { icon: '🔍', text: 'Find transactions quickly with organized labels' }
    ]
  },
  {
    title: 'Track your parties',
    description:
      "Parties are people or businesses you exchange money with. Track who you're dealing with!",
    icon: UsersIcon,
    buttonText: 'Add parties',
    action: 'add-parties',
    benefits: [
      { icon: '🛒', text: 'See how much you spend at each store' },
      { icon: '👥', text: 'Track money lent to friends and family' },
      { icon: '📊', text: 'Analyze your vendor relationships' }
    ]
  },
  {
    title: "You're all set!",
    description:
      'You now understand the core concepts of Trakli. Start tracking and watch your financial awareness grow!',
    icon: ArrowsRightLeftIcon,
    buttonText: 'Get started',
    action: 'complete',
    benefits: [
      { icon: '🎉', text: 'Access your personalized dashboard' },
      { icon: '📱', text: 'Start tracking on the go' },
      { icon: '💡', text: 'Discover new insights about your money' }
    ]
  }
];

const currentStep = computed(() => steps[currentStepIndex.value]);

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++;
  }
};

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
};
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.onboarding-wizard {
  width: 100%;
  background: white;
  border-radius: $radius-xl;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wizard-header {
  padding: 1rem 1.5rem 0.75rem 1.5rem;
  text-align: center;
  background: $primary-light;
  border-bottom: 1px solid $border-gray;

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem 1rem 0.5rem 1rem;
  }
}

.wizard-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 0.75rem 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 1.125rem;
    margin: 0 0 0.5rem 0;
  }
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.step-indicator {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: $border-gray;
  transition: all 0.3s ease;

  &.active {
    background: $primary;
    transform: scaleY(1.5);
  }

  &.completed {
    background: $primary;
  }

  @media (max-width: $breakpoint-sm) {
    width: 30px;
    height: 3px;
  }
}

.steps-container {
  height: 380px;
  overflow: hidden;
  position: relative;

  @media (max-width: $breakpoint-sm) {
    height: 420px;
  }
}

.steps-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide {
  flex: 0 0 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;

  @media (max-width: $breakpoint-sm) {
    padding: 1rem;
  }
}

.step-content {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  flex: 1;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

.step-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, $primary-light 0%, rgba(4, 120, 68, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .icon {
    width: 36px;
    height: 36px;
    color: $primary;
    stroke-width: 1.5;
  }

  @media (max-width: $breakpoint-sm) {
    width: 60px;
    height: 60px;
    margin: 0 auto;

    .icon {
      width: 28px;
      height: 28px;
    }
  }
}

.step-text {
  flex: 1;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 0.75rem 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 1.125rem;
  }
}

.step-description {
  font-size: 1rem;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.9rem;
  }
}

.step-benefits {
  background: $bg-slate;
  border-radius: $radius-lg;
  padding: 1rem;
  border-left: 4px solid $primary;
}

.benefits-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $primary;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.benefits-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .benefit-icon {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .benefit-text {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.4;

    @media (max-width: $breakpoint-sm) {
      font-size: 0.8rem;
    }
  }
}

.step-actions {
  margin-top: 1.5rem;
  text-align: center;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.primary-btn {
  background: $primary;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: $radius-lg;
  padding: 0.875rem 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(4, 120, 68, 0.3);

  &:hover {
    background: $primary-hover;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(4, 120, 68, 0.4);
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;
  }
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: $bg-slate;
  border-top: 1px solid $border-gray;

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem 1.5rem;
  }
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: $text-secondary;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid $border-gray;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  .nav-icon {
    width: 1rem;
    height: 1rem;
  }

  &:hover:not(:disabled) {
    background: $bg-slate;
    color: $primary;
    border-color: $primary;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
  }
}

.step-counter {
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-secondary;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid $border-gray;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.8rem;
    padding: 0.4rem 0.75rem;
  }
}
</style>
