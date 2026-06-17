<template>
  <div class="home-landing-page">
    <ChatExperience mode="landing" />
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
.home-landing-page {
  width: 100%;
}
</style>
