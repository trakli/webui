<template>
  <div class="group-page">
    <TNavbar />
    <div class="group-content-wrapper">
      <TTopCard />
      <div class="table-wrapper">
        <TTableComponent />
      </div>
    </div>
    <TSidebar />
  </div>
</template>

<script setup>
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.group-page {
  display: flex;
  min-height: 100vh;
  background-color: $bg-gray;
  margin-left: var(--sidebar-width, 250px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 250px));
  overflow-x: hidden; /* Prevent horizontal scroll on the page */
}

.group-content-wrapper {
  width: 1200px;
  height: 932px;
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  margin: 0 1.5rem 1rem;
  margin-top: 72px;
  margin-left: 55px;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }
}

.table-wrapper {
  margin-top: 40px;
}
</style>

<style lang="scss">
/* Global styles to hide footer on group page */
.group-page ~ footer,
body:has(.group-page) footer {
  display: none !important;
}
</style>
