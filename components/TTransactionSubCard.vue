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
const _props = defineProps({
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
  min-width: 0;
  border-radius: $radius-xl;
  background-color: $bg-white;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s ease;

  @media (max-width: $breakpoint-md) {
    padding: 0.625rem 0.875rem;
    border-radius: $radius-lg;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem 0.75rem;
    border-radius: $radius-md;
    min-height: 60px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.transaction-sub-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: $breakpoint-sm) {
    gap: 2px;
  }
}

.transaction-sub-card-title {
  margin: 0;
  color: $primary;
  font-weight: $font-bold;
  font-size: $font-size-lg;
  line-height: 1.2;
  position: relative;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.currency-superscript {
  font-size: $font-size-sm;
  font-weight: $font-bold;
  vertical-align: super;
  line-height: 0;
  margin-left: 4px;
  position: relative;
  top: -5px;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xs;
    top: -4px;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
    top: -3px;
    margin-left: 2px;
  }
}

.transaction-sub-card-text {
  margin: 0;
  font-weight: $font-normal;
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.3;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xs;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}
</style>
