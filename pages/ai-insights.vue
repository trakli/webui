<template>
  <div class="ai-insights-page">
    <AIChat />
  </div>
</template>

<script setup>
import AIChat from '@/components/ai/AIChat.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
.ai-insights-page {
  width: 100%;
}
</style>
