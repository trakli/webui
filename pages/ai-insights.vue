<template>
  <div class="ai-insights-page">
    <div class="page-header">
      <Bot class="header-icon" />
      <h1>AI Insights</h1>
    </div>

    <div class="ai-grid">
      <AIChat />
    </div>
  </div>
</template>

<script setup>
import { Bot } from 'lucide-vue-next';
import AIChat from '@/components/ai/AIChat.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.ai-insights-page {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  h1 {
    font-size: $font-size-lg;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;

    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
    }

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-sm;
    }
  }

  @media (max-width: $breakpoint-sm) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
}

.header-icon {
  width: 24px;
  height: 24px;
  color: $primary;

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }
}

.ai-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  width: 100%;

  @media (max-width: $breakpoint-sm) {
    gap: $spacing-2;
  }
}
</style>
