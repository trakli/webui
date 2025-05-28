<template>
  <div class="transaction-sub-card">
    <div class="transaction-sub-card-content">
      <h1 class="transaction-sub-card-title" :style="{ color: titleColor }">
        {{ title
        }}<sup v-if="currency" class="currency-superscript" :style="{ color: titleColor }">{{
          currency
        }}</sup>
      </h1>
      <span class="transaction-sub-card-text" :style="{ color: textColor }">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  title: {
    type: [String, Number],
    default: '48'
  },
  text: {
    type: String,
    default: 'Transactions'
  },
  titleColor: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: ''
  }
});
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.transaction-sub-card {
  width: 222px;
  height: 121px;
  border-radius: $radius-xl;
  background-color: $bg-white;
  padding: 16px 32px 16px 32px;
}

.transaction-sub-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-sub-card-title {
  margin: 0;
  color: $primary;
  font-weight: $font-bold;
  font-size: 48px;
  line-height: 1.2;
  position: relative;
}

.currency-superscript {
  font-size: 14px;
  font-weight: $font-bold;
  vertical-align: super;
  line-height: 0;
  margin-left: 10px;
  position: relative;
  top: -20px;
}

.transaction-sub-card-text {
  margin: 0;
  font-weight: $font-normal;
  font-size: $font-size-xl;
  color: #371e48;
}
</style>
