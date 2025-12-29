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

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
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
  padding: 6rem 1rem 1rem;

  @media (max-width: $breakpoint-lg) {
    padding: 5.5rem 1rem 1rem;
  }

  @media (max-width: $breakpoint-md) {
    width: 100%;
    margin-left: 0;
    padding: 5rem 0.75rem 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 4.5rem 0.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 4rem 0.25rem 1rem;
  }
}

.settings-content-card {
  min-height: calc(100vh - 120px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  padding: 2rem 1rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    border-radius: 1.5rem;
    padding: 1.5rem 0.75rem;
    min-height: calc(100vh - 100px);
  }

  @media (max-width: $breakpoint-sm) {
    border-radius: 1rem;
    padding: 1rem 0.5rem;
    min-height: calc(100vh - 80px);
  }

  @media (max-width: 480px) {
    border-radius: 0.75rem;
    padding: 0.75rem 0.25rem;
  }
}

.settings-page {
  width: 95%;
  margin: auto;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
  }
}

.settings-header {
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
