<template>
  <div class="card-container">
    <div class="background-ellipse"></div>
    <div class="card-content">
      <!-- Card Header -->
      <div class="card-header-content">
        <div class="card-header">
          <span class="total-balance-text">Total Balance</span>
          <ChevronDownIcon class="chevron-icon" />
        </div>
        <span class="balance-amount-text">195,354 XAF</span>
      </div>
      <button class="three-dots-button">
        <EllipsisHorizontalIcon class="three-dots" />
      </button>
    </div>
    <!-- Card Footer -->
    <div class="card-footer">
      <button class="income-button">
        <div class="income-button-content">
          <ArrowDownLeftIcon class="income-arrow-icon" />
          <span class="income-button-text">Income</span>
        </div>
        <span class="income-card-amount-text">150,000 XAF</span>
      </button>
      <button class="expense-button">
        <div class="expense-button-content">
          <ArrowUpLeftIcon class="expense-arrow-icon" />
          <span class="expense-button-text">Expense</span>
        </div>
        <span class="expense-card-amount-text">150,000 XAF</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { EllipsisHorizontalIcon } from '@heroicons/vue/16/solid';
import { ArrowDownLeftIcon, ArrowUpLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card-container {
  width: 100%;
  min-height: 158px;
  background-color: #f5f6f5;
  border: 0.5px solid #c0c6c3;
  border-radius: $radius-xl;
  position: relative;
  box-sizing: border-box;
  padding: 1rem;
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.background-ellipse {
  position: absolute;
  width: 461px;
  height: 461px;
  left: -141px;
  top: -130px;
  background: #e6f2ec;
  border-radius: 50%;
  z-index: 0;
}

.card-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  position: relative;
  z-index: 1;
}

.card-header-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.total-balance-text {
  color: #1d3229;
  font-weight: $font-normal;
  font-size: $font-size-xs;
}

.chevron-icon {
  width: 16px;
  height: 16px;
}

.balance-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-2xl;
}

.three-dots-button {
  width: 36px;
  height: 36px;
  background-color: #cde4da;
  border-radius: $radius-lg;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.three-dots {
  width: 20px;
  height: 20px;
  color: #036a3c;
}

.card-footer {
  width: 100%;
  height: 55px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.income-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 114px;
  height: 45px;
  border-radius: $radius-lg;
  padding: 4px 8px 4px 8px;
  background-color: #ccffd7;
}

.income-button-content {
  width: 98px;
  height: 16px;
  gap: 4px;
  display: flex;
  flex-direction: row;
}

.income-arrow-icon {
  width: 16px;
  height: 16px;
  color: #00c12a;
}

.income-button-text {
  font-weight: $font-normal;
  font-size: $font-size-xs;
  color: #00c12a;
}

.income-card-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-base;
  margin-bottom: 10px;
}

.expense-button {
  width: 114px;
  height: 45px;
  border-radius: $radius-lg;
  padding: 4px 8px 4px 8px;
  background-color: #ffcccc;
}

.expense-button-content {
  width: 98px;
  height: 16px;
  gap: 4px;
  display: flex;
  flex-direction: row;
}

.expense-arrow-icon {
  width: 16px;
  height: 16px;
  color: #c10000;
}

.expense-button-text {
  font-weight: $font-normal;
  font-size: $font-size-xs;
  color: #c10000;
}

.expense-card-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-base;
  margin-bottom: 10px;
}
</style>
