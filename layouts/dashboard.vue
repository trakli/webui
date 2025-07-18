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
  </div>
</template>

<script setup>
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard-layout {
  background-color: $bg-gray;
  min-height: 100vh;
}

.main-content {
  margin-left: var(--sidebar-width, 300px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 300px));
  overflow-x: hidden;
}

.content-wrapper {
  width: 100%;
  padding: 0.5rem 2rem;
  margin-top: $navbar-height;
  box-sizing: border-box;

  @media (max-width: $breakpoint-lg) {
    padding: 1rem 1.5rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
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

  @media (min-width: 768px) {
    padding: 1.25rem;
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
