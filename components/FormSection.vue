<template>
  <div class="form-container">
    <div class="form-header">
      <button
        type="button"
        class="income-button"
        :class="{ 'income-button--selected': isIncomeSelected }"
        @click="selectIncome"
      >
        <ArrowDownTrayIcon class="income-icon" />
        <span>Income</span>
        <div v-if="isIncomeSelected" class="income-tab"></div>
      </button>

      <button
        type="button"
        class="expense-button"
        :class="{ 'expense-button--selected': isExpenseSelected }"
        @click="selectExpense"
      >
        <ArrowUpTrayIcon class="expense-icon" />
        <span>Expense</span>
        <div v-if="isExpenseSelected" class="expense-tab"></div>
      </button>
    </div>

    <div class="form-content">
      <TransactionForm
        :is-outcome-selected="isExpenseSelected"
        :editingItem="props.editingItem"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import TransactionForm from './TransactionForm.vue';

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

.form-container {
  width: 100%;
  max-width: 800px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: $bg-gray;
  border-radius: $radius-xl;
  gap: 40px;
  padding: 24px;

  @media (max-width: $breakpoint-lg) {
    padding: 20px;
    gap: 32px;
  }

  @media (max-width: $breakpoint-md) {
    padding: 16px;
    gap: 24px;
    min-height: auto;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 12px;
    gap: 20px;
    border-radius: $radius-lg;
  }
}

.form-header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 576px;
  height: 53px;
  border-bottom: 1px solid #767a90;
  gap: 16px;
  margin: 0 auto;

  @media (max-width: $breakpoint-sm) {
    height: 48px;
    gap: 12px;
  }
}

.income-button,
.expense-button {
  position: relative;
  width: 115px;
  height: 53px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.income-button {
  &--selected {
    background-color: #e6f2ec;
  }
}

.expense-button {
  &--selected {
    background-color: #fce8e8;
  }
}

.income-tab {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 99px;
  height: 4px;
  background-color: #047844;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.expense-tab {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 99px;
  height: 4px;
  background-color: #eb5757;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.income-icon,
.expense-icon {
  width: 20px;
  height: 20px;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
</style>
