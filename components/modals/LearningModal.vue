<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal" @keydown.esc="closeModal">
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      @click.stop
    >
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title">💡 Learn Trakli</h2>
        <button class="close-btn" aria-label="Close modal" @click="closeModal">
          <XMarkIcon class="close-icon" />
        </button>
      </div>

      <div class="modal-body">
        <div class="learning-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="tab-icon" />
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'concepts'" class="concepts-section">
            <h3 class="section-title">Core Concepts</h3>
            <div class="concept-cards">
              <div v-for="concept in concepts" :key="concept.title" class="concept-card">
                <div class="concept-header">
                  <component :is="concept.icon" class="concept-icon" />
                  <h4 class="concept-title">{{ concept.title }}</h4>
                </div>
                <p class="concept-description">{{ concept.description }}</p>
                <div class="concept-tips">
                  <span class="tips-label">💡 Tips:</span>
                  <ul class="tips-list">
                    <li v-for="tip in concept.tips" :key="tip">{{ tip }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'tips'" class="tips-section">
            <h3 class="section-title">Quick Tips</h3>
            <div class="tips-grid">
              <div v-for="tip in quickTips" :key="tip.title" class="tip-card">
                <div class="tip-emoji">{{ tip.emoji }}</div>
                <h4 class="tip-title">{{ tip.title }}</h4>
                <p class="tip-text">{{ tip.text }}</p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'shortcuts'" class="shortcuts-section">
            <h3 class="section-title">Keyboard Shortcuts</h3>
            <div class="shortcuts-list">
              <div v-for="shortcut in shortcuts" :key="shortcut.action" class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd v-for="key in shortcut.keys" :key="key" class="key">{{ key }}</kbd>
                </div>
                <span class="shortcut-action">{{ shortcut.action }}</span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'faq'" class="faq-section">
            <h3 class="section-title">Frequently Asked Questions</h3>
            <div class="faq-list">
              <div v-for="faq in faqs" :key="faq.question" class="faq-item">
                <button
                  class="faq-question"
                  :class="{ open: openFaq === faq.question }"
                  @click="toggleFaq(faq.question)"
                >
                  {{ faq.question }}
                  <ChevronDownIcon class="faq-chevron" />
                </button>
                <div v-if="openFaq === faq.question" class="faq-answer">
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  XMarkIcon,
  ChevronDownIcon,
  CreditCardIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  UsersIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CommandLineIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline';

const _props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const activeTab = ref('concepts');
const openFaq = ref(null);

const tabs = [
  { id: 'concepts', label: 'Concepts', icon: AcademicCapIcon },
  { id: 'tips', label: 'Tips', icon: LightBulbIcon },
  { id: 'shortcuts', label: 'Shortcuts', icon: CommandLineIcon },
  { id: 'faq', label: 'FAQ', icon: QuestionMarkCircleIcon }
];

const concepts = [
  {
    title: 'Transactions',
    icon: ArrowsRightLeftIcon,
    description:
      'The foundation of expense tracking. Every transaction tells the story of money moving in or out.',
    tips: [
      'Add transactions regularly for accurate tracking',
      'Use clear descriptions to remember what each transaction was for',
      'Income transactions increase your balance, expenses decrease it'
    ]
  },
  {
    title: 'Wallets',
    icon: CreditCardIcon,
    description:
      'Represent your money sources - bank accounts, cash, credit cards, or any place you store money.',
    tips: [
      'Start with your main bank account',
      'Add all your payment methods for complete tracking',
      'Update balances regularly to stay accurate'
    ]
  },
  {
    title: 'Categories',
    icon: TagIcon,
    description: 'Group similar transactions to understand spending patterns and financial habits.',
    tips: [
      'Use specific categories like "Coffee" instead of generic "Food"',
      'Create both income and expense categories',
      "Don't create too many - keep it manageable"
    ]
  },
  {
    title: 'Parties',
    icon: UsersIcon,
    description:
      'People or businesses you exchange money with. Helps track relationships and spending patterns.',
    tips: [
      'Add your employer for salary tracking',
      'Include frequent merchants like grocery stores',
      'Use parties to identify spending habits with specific vendors'
    ]
  }
];

const quickTips = [
  {
    emoji: '⚡',
    title: 'Quick Entry',
    text: 'Use the "Add Transaction" button in the navbar for fastest entry from anywhere in the app.'
  },
  {
    emoji: '📊',
    title: 'Dashboard Overview',
    text: 'Your dashboard shows the big picture - total income, expenses, and net balance at a glance.'
  },
  {
    emoji: '🔍',
    title: 'Search & Filter',
    text: 'Use search and filters to find specific transactions or analyze spending patterns.'
  },
  {
    emoji: '📱',
    title: 'Mobile Friendly',
    text: 'Trakli works great on mobile - add transactions on the go whenever you spend money.'
  },
  {
    emoji: '🎯',
    title: 'Be Consistent',
    text: 'Regular tracking leads to better insights. Try to add transactions daily or weekly.'
  },
  {
    emoji: '💡',
    title: 'Start Simple',
    text: 'Begin with basic categories and wallets. You can always add more detail as you get comfortable.'
  }
];

const shortcuts = [
  { keys: ['Ctrl', '+'], action: 'Add new transaction' },
  { keys: ['Ctrl', '/'], action: 'Open search' },
  { keys: ['Ctrl', 'D'], action: 'Go to dashboard' },
  { keys: ['Esc'], action: 'Close modals/dropdowns' },
  { keys: ['?'], action: 'Open this help modal' }
];

const faqs = [
  {
    question: 'How often should I add transactions?',
    answer:
      'For best results, add transactions daily or weekly. The more frequently you track, the more accurate your financial picture becomes.'
  },
  {
    question: "What's the difference between wallets and categories?",
    answer:
      'Wallets represent WHERE your money is (bank account, cash, credit card). Categories represent WHAT you spent money on (food, transport, salary).'
  },
  {
    question: 'Do I need to add every small transaction?',
    answer:
      'It depends on your goals. For complete tracking, yes. But if you prefer, you can set a minimum amount (like $5) and only track larger expenses.'
  },
  {
    question: 'How do I handle transfers between accounts?',
    answer:
      'Create two transactions: one expense from the source account and one income to the destination account, using the same amount.'
  },
  {
    question: 'Can I edit or delete transactions?',
    answer:
      'Yes! Click on any transaction to edit its details, or use the delete option if you added something by mistake.'
  },
  {
    question: 'What if I forget to add transactions?',
    answer:
      'No problem! You can add past transactions by changing the date. Try to catch up weekly to stay current.'
  }
];

const closeModal = () => {
  emit('close');
};

const toggleFaq = (question) => {
  openFaq.value = openFaq.value === question ? null : question;
};
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid $border-gray;
  background: $primary-light;

  @media (max-width: $breakpoint-sm) {
    padding: 1rem 1.5rem;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 1.25rem;
  }
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: $text-secondary;
}

.modal-body {
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.learning-tabs {
  display: flex;
  border-bottom: 1px solid $border-gray;
  background: $bg-slate;
  padding: 0 2rem;

  @media (max-width: $breakpoint-sm) {
    padding: 0 1rem;
    overflow-x: auto;
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: $text-secondary;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  .tab-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  &:hover {
    color: $primary;
    background: rgba(4, 120, 68, 0.05);
  }

  &.active {
    color: $primary;
    border-bottom-color: $primary;
    background: white;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

.tab-content {
  padding: 2rem;

  @media (max-width: $breakpoint-sm) {
    padding: 1.5rem;
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 1.5rem 0;
}

.concept-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.concept-card {
  background: $bg-slate;
  border: 1px solid $border-gray;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid $primary;
}

.concept-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.concept-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: $primary;
}

.concept-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.concept-description {
  color: $text-secondary;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.concept-tips {
  .tips-label {
    font-weight: 600;
    color: $primary;
    font-size: 0.875rem;
  }
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;

  li {
    color: $text-secondary;
    font-size: 0.875rem;
    padding: 0.25rem 0;
    position: relative;
    padding-left: 1rem;

    &::before {
      content: '•';
      color: $primary;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
  }
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tip-card {
  background: white;
  border: 1px solid $border-gray;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.tip-emoji {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.tip-title {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 0.5rem 0;
}

.tip-text {
  color: $text-secondary;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: $bg-slate;
  border-radius: 8px;
  border: 1px solid $border-gray;
}

.shortcut-keys {
  display: flex;
  gap: 0.25rem;
}

.key {
  background: white;
  border: 1px solid $border-light;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: $text-primary;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.shortcut-action {
  color: $text-secondary;
  font-size: 0.875rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.faq-item {
  border: 1px solid $border-gray;
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: $bg-slate;
  border: none;
  text-align: left;
  font-weight: 500;
  color: $text-primary;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: $bg-card;
  }

  &.open {
    background: white;
  }
}

.faq-chevron {
  width: 1rem;
  height: 1rem;
  color: $text-secondary;
  transition: transform 0.2s ease;

  .faq-question.open & {
    transform: rotate(180deg);
  }
}

.faq-answer {
  padding: 1rem;
  background: white;
  color: $text-secondary;
  line-height: 1.6;
  border-top: 1px solid $border-gray;
}
</style>
