<template>
  <div class="navbar">
    <div class="navbar-right">
      <div class="search-container">
        <TButton size="small" text="Add Transaction +" to="/transactions/new" />
        <button class="icon-button">
          <BellIcon class="icon" />
        </button>
        <button class="icon-button">
          <MagnifyingGlassIcon class="icon" />
        </button>
        <LanguageSelector />
      </div>
      <div class="avatar-container">
        <TAvatar image-url="/userImage.png" :show-dropdown="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TAvatar from './TAvatar.vue';
import TButton from './TButton.vue';
import LanguageSelector from './LanguageSelector.vue';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/vue/24/outline';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.navbar {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: $navbar-height;
  padding: 0 5rem;
  background-color: $bg-gray;
  border-bottom: 1px solid #e9ecef;
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width, 300px);
  z-index: 10;
  transition: left 0.3s ease;

  @media (max-width: 1200px) {
    left: 250px;
  }

  @media (max-width: 992px) {
    left: 200px;
  }

  @media (max-width: 768px) {
    left: 0;
    padding: 0 1rem;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;

    @media (max-width: 768px) {
      gap: 0.75rem;
    }
  }

  .search-container {
    display: flex;
    flex-direction: row;
    gap: 16px;
    position: relative;
    width: 396px;
  }

  .icon {
    width: 20px;
    height: 20px;
    color: #1d3229;
  }

  .icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    width: 36px;
    height: $navbar-icon-button-height;
    border-radius: $radius-lg;
    background-color: #dee1e0;
    border: none;
    cursor: pointer;
  }

  .avatar-container {
    display: flex;
    flex-direction: row;
    align-items: center;

    @media (max-width: 480px) {
      display: none;
    }
  }
}
</style>
