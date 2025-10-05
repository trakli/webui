<template>
  <div class="transaction-tabs">
    <div class="tab-buttons">
      <button class="tab-button" :class="{ active: isIncomeSelected }" @click="selectIncome">
        <ArrowDownTrayIcon class="tab-icon" />
        Income Transaction
      </button>
      <button class="tab-button" :class="{ active: isExpenseSelected }" @click="selectExpense">
        <ArrowUpTrayIcon class="tab-icon" />
        Expense Transaction
      </button>
    </div>

    <div class="tab-content">
      <TransactionFormContainer
        :is-outcome-selected="isExpenseSelected"
        :editing-item="props.editingItem"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import TransactionFormContainer from './TransactionFormContainer.vue';

const props = defineProps({
  editingItem: { type: Object, default: null }
});

const emit = defineEmits(['submit']);

const isIncomeSelected = ref(true);
const isExpenseSelected = ref(false);

const selectIncome = () => {
  isIncomeSelected.value = true;
  isExpenseSelected.value = false;
};

const selectExpense = () => {
  isExpenseSelected.value = true;
  isIncomeSelected.value = false;
};

const handleSubmit = (data) => {
  emit('submit', data);
};

// When editing, reflect the transaction type into the toggle
watch(
  () => props.editingItem,
  (item) => {
    if (!item) return;
    if (item.type === 'EXPENSE') {
      isExpenseSelected.value = true;
      isIncomeSelected.value = false;
    } else {
      isIncomeSelected.value = true;
      isExpenseSelected.value = false;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.transaction-tabs {
  width: 100%;
  max-width: 800px;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;

  @media (max-width: $breakpoint-sm) {
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: $text-secondary;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;

  @media (max-width: $breakpoint-md) {
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    gap: 0.25rem;
  }

  &:hover {
    background: #f8fafc;
    color: $primary;
  }

  // Hover state for expense button (second child)
  &:nth-child(2):hover {
    color: #dc2626;
  }

  &.active {
    color: $primary;
    background: #f0f9ff;
    border-bottom-color: $primary;
  }

  // Active state for expense button (second child)
  &:nth-child(2).active {
    color: #dc2626;
    background: #fee2e2;
    border-bottom-color: #dc2626;
  }
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.tab-content {
  width: 100%;
}
</style>
