<template>
  <div class="settings-layout">
    <TSidebar />
    <TNavbar />
    <div class="settings-content">
      <div class="settings-content-card">
        <div class="settings-page">
          <div class="settings-header">
            <Bot class="header-icon" />
            <h1>AI Insights</h1>
          </div>

          <div class="ai-grid">
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bot } from 'lucide-vue-next';
import TSidebar from '@/components/TSidebar.vue';
import TNavbar from '@/components/TNavbar.vue';
import AIChat from '@/components/ai/AIChat.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.settings-layout {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  background-color: $bg-gray;
  min-height: 100vh;
}

.settings-content {
  margin-left: var(--sidebar-width, 300px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 300px));
  overflow-x: hidden;
  padding: 3.5rem $spacing-4 $spacing-4;

  @media (max-width: $breakpoint-md) {
    width: 100%;
    margin-left: 0;
    padding: $spacing-5 $spacing-3;
  }
}

.settings-content-card {
  min-height: calc(100vh - 100px);
  background-color: $bg-white;
  border-radius: $radius-xl * 2;
  border: 1px solid $bg-gray;
  padding: $spacing-8 $spacing-2 $spacing-2;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-6 $spacing-4;
  }
}

.settings-page {
  width: 95%;
  margin: auto;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin: $spacing-4;
  padding: $spacing-3;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: $primary;
}

.ai-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
}
</style>
