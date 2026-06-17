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
  height: 100%;
}
</style>

<style lang="scss">
.content-wrapper .dashboard-content:has(.home-landing-page) {
  padding: 0;
  overflow: hidden;
}

.content-wrapper .dashboard-content:has(.home-landing-page) .dashboard-content-container {
  height: 100%;
}
</style>
