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
@use '@/assets/scss/_variables.scss' as *;

.transaction-sub-card {
  flex: 1;
  min-width: 0; /* Prevents flex items from overflowing */
  border-radius: $radius-xl;
  background-color: $bg-white;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  font-size: $font-size-lg;
  line-height: 1.2;
  position: relative;
}

.currency-superscript {
  font-size: $font-size-sm;
  font-weight: $font-bold;
  vertical-align: super;
  line-height: 0;
  margin-left: 4px;
  position: relative;
  top: -5px;
}

.transaction-sub-card-text {
  margin: 0;
  font-weight: $font-normal;
  font-size: $font-size-sm;
  color: #371e48;
}
</style>
