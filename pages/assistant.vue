<template>
  <div class="assistant-page">
    <ChatExperience mode="full" />
  </div>
</template>

<script setup>
import ChatExperience from '@/components/ai/ChatExperience.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
.assistant-page {
  width: 100%;
}
</style>
