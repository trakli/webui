<template>
  <div class="dashboard-layout">
    <TSidebar />
    <div class="main-content" :class="{ 'main-content--collapsed': sidebarCollapsed }">
      <TNavbar />
      <div class="content-wrapper">
        <div class="dashboard-content">
          <div class="dashboard-content-container">
            <slot />
          </div>
        </div>
      </div>
    </div>
    <NotificationsContainer />
    <LearningModal :is-open="showLearningModal" @close="showLearningModal = false" />
  </div>
</template>

<script setup>
import { onMounted, ref, provide } from 'vue';
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
import NotificationsContainer from '@/components/NotificationsContainer.vue';
import LearningModal from '@/components/modals/LearningModal.vue';
import { useAuth } from '@/composables/useAuth';
import { useSidebar } from '@/composables/useSidebar';

const { fetchUser } = useAuth();
const { sidebarCollapsed } = useSidebar();

const showLearningModal = ref(false);

const openLearningModal = () => {
  showLearningModal.value = true;
};

provide('learningModal', {
  open: openLearningModal
});

onMounted(() => {
  fetchUser();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard-layout {
  background-color: $bg-gray;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    margin-left 0.25s ease,
    width 0.25s ease;

  @media (min-width: $breakpoint-md) {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});

    &--collapsed {
      margin-left: $sidebar-rail-width;
      width: calc(100% - #{$sidebar-rail-width});
    }
  }

  @media (max-width: #{$breakpoint-md - 1px}) {
    margin-left: 0;
    width: 100%;
  }
}

.content-wrapper {
  width: 100%;
  margin-top: $navbar-height;
  height: calc(100vh - #{$navbar-height});
  box-sizing: border-box;
  padding: 0.25rem 1.25rem 0.5rem;
  overflow: hidden;

  @media (max-width: $breakpoint-lg) {
    padding: 0.25rem 1rem 0.5rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 0.25rem 0.5rem 0.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.25rem;
  }
}

.dashboard-content {
  height: 100%;
  background-color: $bg-white;
  border-radius: 1.25rem;
  border: 1px solid $bg-gray;
  padding: 1rem 1.25rem;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: $breakpoint-lg) {
    padding: 0.875rem 1rem;
    border-radius: 1rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 0.75rem;
    border-radius: 0.75rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    margin: 0;
    padding: 0;
  }
}
</style>

<style lang="scss">
body:has(.dashboard-layout) footer {
  display: none !important;
}
</style>
