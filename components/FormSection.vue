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
        class="outcome-button"
        :class="{ 'outcome-button--selected': isOutcomeSelected }"
        @click="selectOutcome"
      >
        <ArrowUpTrayIcon class="outcome-icon" />
        <span>Outcome</span>
        <div v-if="isOutcomeSelected" class="outcome-tab"></div>
      </button>
    </div>

    <div class="form-content">
      <TransactionForm :is-outcome-selected="isOutcomeSelected" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import TransactionForm from './TransactionForm.vue';

const isIncomeSelected = ref(true);
const isOutcomeSelected = ref(false);

const selectIncome = () => {
  isIncomeSelected.value = true;
  isOutcomeSelected.value = false;
};

const selectOutcome = () => {
  isOutcomeSelected.value = true;
  isIncomeSelected.value = false;
};
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.form-container {
  width: 640px;
  height: 1271px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: $bg-gray;
  border-radius: $radius-xl;
  gap: 40px;
}

.form-header {
  display: flex;
  align-items: center;
  width: 576px;
  height: 53px;
  border-bottom: 1px solid #767a90;
  gap: 16px;
}

.income-button,
.outcome-button {
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

.outcome-button {
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

.outcome-tab {
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
.outcome-icon {
  width: 20px;
  height: 20px;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
