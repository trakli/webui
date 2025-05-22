<script setup>
import RegisterCard from '@/components/RegisterCard.vue';
import TFooter from '@/components/TFooter.vue';
</script>

<template>
  <div class="register-container">
    <div class="register-grid">
      <div class="sidebar">
        <img src="/SidebarImage.svg" alt="Side Bar Image" class="sidebar-image" />
      </div>
      <div class="form-section">
        <div class="form-content">
          <div class="form-wrapper">
            <RegisterCard />
          </div>
          <TFooter :background-color="'var(--bg-white)'" :border-color="'var(--border-light)'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.register-container {
  background-color: $bg-white;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.register-grid {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  position: relative;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 40% 60%;
  }
}

.sidebar {
  display: none;
  background-color: $primary;
  padding: $spacing-8;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (min-width: $breakpoint-md) {
    display: flex;
  }
}

.sidebar-image {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: $spacing-8;
}

.form-section {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background-color: $bg-white;
}

.form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8 $spacing-4;
  width: 100%;
  overflow-y: auto;
}

.form-wrapper {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-8;
}

.form-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-white;
}

.form-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 80%;
  margin: 0 auto;
  padding: $spacing-8 0;
  box-sizing: border-box;
}

.form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 100%;
}

/* Footer is now a direct child of form-content */

.logo {
  width: 195px;
  height: auto;
  margin: 0 auto;
}
</style>
