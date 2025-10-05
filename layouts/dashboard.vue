<template>
  <div class="dashboard-layout">
    <TSidebar />
    <div class="main-content">
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
import NotificationsContainer from '@/components/NotificationsContainer.vue';
import { useAuth } from '@/composables/useAuth';

const { fetchUser } = useAuth();

onMounted(() => {
  fetchUser();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard-layout {
  background-color: $bg-gray;
  min-height: 100vh;
}

.main-content {
  transition: margin-left 0.3s ease;
  overflow-x: hidden;

  // Desktop - account for sidebar
  @media (min-width: $breakpoint-md) {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});
  }

  // Mobile - full width
  @media (max-width: #{$breakpoint-md - 1px}) {
    margin-left: 0;
    width: 100%;
  }
}

.content-wrapper {
  width: 100%;
  margin-top: $navbar-height;
  box-sizing: border-box;
  padding: 0.5rem 2rem;

  @media (max-width: $breakpoint-lg) {
    padding: 1rem 1.5rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 0.75rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
  }
}

.dashboard-content {
  min-height: calc(100vh - 100px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: $breakpoint-lg) {
    padding: 1.25rem;
    border-radius: 1.5rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
    border-radius: 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem;
    border-radius: 0.75rem;
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
